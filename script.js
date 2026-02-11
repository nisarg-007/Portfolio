/* ============================================
   NISARG M SHAH — PORTFOLIO SCRIPTS
   Particles | Typing | Scroll Reveal | Filters
   ============================================ */

// ——— Particle Background ———
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
            this.ctx.fill();

            // Connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(108, 99, 255, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ——— Typing Effect ———
class TypingEffect {
    constructor(element, words, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.words = words;
        this.typeSpeed = typeSpeed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentWord = this.words[this.wordIndex];

        if (this.isDeleting) {
            this.charIndex--;
            this.element.textContent = currentWord.substring(0, this.charIndex);
        } else {
            this.charIndex++;
            this.element.textContent = currentWord.substring(0, this.charIndex);
        }

        let speed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

        if (!this.isDeleting && this.charIndex === currentWord.length) {
            speed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            speed = 500;
        }

        setTimeout(() => this.type(), speed);
    }
}

// ——— Scroll Reveal ———
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.reveal');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 80);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.elements.forEach((el) => this.observer.observe(el));
    }
}

// ——— Counter Animation ———
class CounterAnimation {
    constructor() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach((counter) => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.floor(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(update);
    }
}

// ——— Navbar ———
class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navLinks = document.getElementById('navLinks');
        this.links = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section, .hero');

        window.addEventListener('scroll', () => this.onScroll());
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        this.links.forEach((link) => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }

    onScroll() {
        // Scrolled state
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        let current = '';
        this.sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        this.links.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navLinks.classList.toggle('open');
        document.body.style.overflow = this.navLinks.classList.contains('open') ? 'hidden' : '';
    }

    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navLinks.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ——— Project Filters ———
class ProjectFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');

        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', () => this.filter(btn));
        });
    }

    filter(activeBtn) {
        const filterValue = activeBtn.getAttribute('data-filter');

        // Update active button
        this.filterBtns.forEach((btn) => btn.classList.remove('active'));
        activeBtn.classList.add('active');

        // Filter cards with animation
        this.projectCards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            const shouldShow = filterValue === 'all' || category === filterValue;

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, index * 60);
            } else {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.classList.add('hidden');
                }, 300);
            }
        });
    }
}

// ——— Cursor Glow ———
class CursorGlow {
    constructor() {
        this.glow = document.getElementById('cursorGlow');
        if (!this.glow) return;

        // Only on desktop
        if (window.innerWidth < 768) {
            this.glow.style.display = 'none';
            return;
        }

        window.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                this.glow.style.left = e.clientX + 'px';
                this.glow.style.top = e.clientY + 'px';
            });
        });
    }
}

// ——— Smooth Scroll for anchor links ———
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ——— Tilt Effect on Project Cards ———
function initTiltEffect() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ——— Skill Tag Hover Stagger ———
function initSkillAnimation() {
    document.querySelectorAll('.skill-category').forEach((category) => {
        category.addEventListener('mouseenter', () => {
            const tags = category.querySelectorAll('.skill-tag');
            tags.forEach((tag, i) => {
                tag.style.transitionDelay = `${i * 30}ms`;
                tag.style.transform = 'translateY(-2px)';
            });
        });

        category.addEventListener('mouseleave', () => {
            const tags = category.querySelectorAll('.skill-tag');
            tags.forEach((tag) => {
                tag.style.transitionDelay = '0ms';
                tag.style.transform = 'translateY(0)';
            });
        });
    });
}

// ——— Initialize Everything ———
document.addEventListener('DOMContentLoaded', () => {
    // Particle system
    const canvas = document.getElementById('particles');
    if (canvas) new ParticleSystem(canvas);

    // Typing effect
    const typingEl = document.getElementById('typingText');
    if (typingEl) {
        new TypingEffect(typingEl, [
            'Data Scientist',
            'ML Engineer',
            'Business Analyst',
            'Data Analyst',
            'Software Developer',
            'Problem Solver',
        ]);
    }

    // Scroll reveal
    new ScrollReveal();

    // Counter animation
    new CounterAnimation();

    // Navbar
    new Navbar();

    // Project filters
    new ProjectFilter();

    // Cursor glow
    new CursorGlow();

    // Smooth scroll
    initSmoothScroll();

    // Tilt effect
    initTiltEffect();

    // Skill animation
    initSkillAnimation();
});
