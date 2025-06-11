// Stockly Website - JavaScript Interativo
document.addEventListener('DOMContentLoaded', function() {

    // ===== NAVEGAÇÃO SUAVE =====
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== HEADER DINÂMICO =====
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.backdropFilter = 'blur(25px)';
            header.style.boxShadow = '0 4px 30px rgba(139, 92, 246, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.boxShadow = '0 2px 20px rgba(139, 92, 246, 0.1)';
        }
    });

    // ===== ANIMAÇÕES DE SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-item, .testimonial-item, .team-member');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ===== MODAL DE DEMONSTRAÇÃO =====
    const btnDemo = document.getElementById("btn-demo");
    const modal = document.getElementById("modal-dev");
    const modalClose = document.getElementById("modal-close");

    if (btnDemo && modal && modalClose) {
        btnDemo.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.add("show");
        });

        modalClose.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
            }
        });
    }

    // ===== EFEITOS HOVER AVANÇADOS =====
    const featureItems = document.querySelectorAll('.feature-item');

    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02) rotateX(5deg)';
            this.style.boxShadow = '0 25px 50px rgba(139, 92, 246, 0.3)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
            this.style.boxShadow = 'none';
        });
    });

    // ===== FORMULÁRIO DE CONTATO =====
    const contactForm = document.querySelector('.contact-section form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            const dados = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                empresa: formData.get('empresa'),
                mensagem: formData.get('mensagem')
            };

            if (!dados.nome || !dados.email) {
                window.StocklyUtils.showNotification('Nome e email são obrigatórios!', 'error');
                return;
            }

            submitButton.textContent = 'Enviando...';
            submitButton.style.background = 'linear-gradient(45deg, #8B5CF6, #A855F7)';
            submitButton.disabled = true;

            try {
                const response = await fetch('http://localhost:5001/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dados)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    submitButton.textContent = 'Enviado!';
                    submitButton.style.background = 'linear-gradient(45deg, #10B981, #059669)';
                    window.StocklyUtils.showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');

                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)';
                        submitButton.disabled = false;
                        contactForm.reset();
                    }, 3000);
                } else {
                    throw new Error(result.message || 'Erro ao enviar mensagem');
                }

            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                submitButton.textContent = 'Erro no envio';
                submitButton.style.background = 'linear-gradient(45deg, #EF4444, #DC2626)';
                window.StocklyUtils.showNotification(error.message || 'Erro ao enviar mensagem. Tente novamente.', 'error');

                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)';
                    submitButton.disabled = false;
                }, 3000);
            }
        });

        const inputs = contactForm.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                this.style.borderColor = this.value.trim() === ''
                    ? 'rgba(239, 68, 68, 0.5)'
                    : 'rgba(139, 92, 246, 0.5)';
                this.style.boxShadow = this.value.trim() === ''
                    ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                    : '0 0 0 3px rgba(139, 92, 246, 0.1)';
            });

            input.addEventListener('focus', function() {
                this.style.borderColor = 'rgba(139, 92, 246, 0.7)';
                this.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)';
            });
        });
    }

    // ===== EFEITO PARALLAX SUTIL =====
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');

        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // ===== MICRO-INTERAÇÕES =====
    const ctaButton = document.querySelector('.cta-button');

    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05) rotateZ(1deg)';
        });

        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateZ(0deg)';
        });

        ctaButton.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-5px) scale(0.98)';
        });

        ctaButton.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
    }

    // ===== ANIMAÇÃO DE DIGITAÇÃO PARA O TÍTULO =====
    const heroTitle = document.querySelector('.hero-section h1');

    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        setTimeout(typeWriter, 1000);
    }

    console.log('🚀 Stockly Website carregado com sucesso!');
});


// ===== UTILITÁRIOS GLOBAIS =====
window.StocklyUtils = {
    scrollToSection: function(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        let backgroundColor = 'rgba(139, 92, 246, 0.9)';
        if (type === 'error') {
            backgroundColor = 'rgba(239, 68, 68, 0.9)';
        } else if (type === 'success') {
            backgroundColor = 'rgba(16, 185, 129, 0.9)';
        }

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${backgroundColor};
            color: white;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
};