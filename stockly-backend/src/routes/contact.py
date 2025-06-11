from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from src.models.user import db, Contact

contact_bp = Blueprint('contact', __name__)

def enviar_email_notificacao(contato_data):
    """Envia e-mail de notificação quando um novo contato é criado"""
    try:
        from src.main import mail
        
        # Debug: Verificar configurações
        print(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
        print(f"MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
        print(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        
        # Verificar se o remetente está configurado
        sender_email = current_app.config.get('MAIL_USERNAME') or current_app.config.get('MAIL_DEFAULT_SENDER')
        if not sender_email:
            print("Erro: MAIL_USERNAME ou MAIL_DEFAULT_SENDER não configurado")
            return False
        
        # Criar o e-mail
        msg = Message(
            subject='Nova Mensagem de Contato - Stockly',
            recipients=['cristinafoliveira98@gmail.com'],  # Email que vai receber a notificação
            sender=sender_email,  # Adiciona o remetente explicitamente
            html=f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">
                        Nova Mensagem de Contato - Stockly
                    </h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1F2937; margin-top: 0;">Detalhes do Contato:</h3>
                        
                        <p><strong>Nome:</strong> {contato_data.get('nome', 'Não informado')}</p>
                        <p><strong>E-mail:</strong> {contato_data.get('email', 'Não informado')}</p>
                        <p><strong>Telefone:</strong> {contato_data.get('telefone', 'Não informado') or 'Não informado'}</p>
                        <p><strong>Empresa:</strong> {contato_data.get('empresa', 'Não informado') or 'Não informado'}</p>
                        
                        <div style="margin-top: 20px;">
                            <strong>Mensagem:</strong>
                            <div style="background-color: white; padding: 15px; border-left: 4px solid #8B5CF6; margin-top: 10px;">
                                {contato_data.get('mensagem', 'Nenhuma mensagem fornecida') or 'Nenhuma mensagem fornecida'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            Esta mensagem foi enviada automaticamente pelo sistema de contato do site Stockly.
                            <br>Data: {contato_data.get('data_criacao', 'Não disponível')}
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        
        # Enviar o e-mail
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Erro ao enviar e-mail: {str(e)}")
        return False

@contact_bp.route('/contact', methods=['POST'])
def create_contact():
    try:
        # Obter dados do formulário
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('nome') or not data.get('email'):
            return jsonify({
                'success': False,
                'message': 'Nome e email são obrigatórios'
            }), 400
        
        # Criar novo contato
        novo_contato = Contact(
            nome=data.get('nome'),
            email=data.get('email'),
            telefone=data.get('telefone'),
            empresa=data.get('empresa'),
            mensagem=data.get('mensagem')
        )
        
        # Salvar no banco de dados
        db.session.add(novo_contato)
        db.session.commit()
        
        # Preparar dados para o e-mail
        contato_dict = novo_contato.to_dict()
        
        # Tentar enviar e-mail de notificação
        email_enviado = enviar_email_notificacao(contato_dict)
        
        response_data = {
            'success': True,
            'message': 'Contato salvo com sucesso!',
            'data': contato_dict
        }
        
        # Adicionar informação sobre o e-mail na resposta
        if email_enviado:
            response_data['email_status'] = 'E-mail de notificação enviado com sucesso'
        else:
            response_data['email_status'] = 'Contato salvo, mas houve problema no envio do e-mail'
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro interno do servidor: {str(e)}'
        }), 500

@contact_bp.route('/contacts', methods=['GET'])
def get_contacts():
    try:
        # Buscar todos os contatos
        contatos = Contact.query.order_by(Contact.data_criacao.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [contato.to_dict() for contato in contatos],
            'total': len(contatos)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao buscar contatos: {str(e)}'
        }), 500

@contact_bp.route('/contact/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    try:
        contato = Contact.query.get_or_404(contact_id)
        
        return jsonify({
            'success': True,
            'data': contato.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Contato não encontrado: {str(e)}'
        }), 404