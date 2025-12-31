// ============================================
// Custom Cursor
// ============================================
const cursorFollower = document.getElementById('cursorFollower');
const cursorDot = document.getElementById('cursorDot');

let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;
let dotX = 0;
let dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate dot position
    dotX = e.clientX;
    dotY = e.clientY;
});

function animateCursor() {
    // Smooth follower animation
    const speed = 0.2;
    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;
    
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
    
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor size change on hover
const interactiveElements = document.querySelectorAll('a, button, .feature-card, .stat-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorFollower.style.width = '60px';
        cursorFollower.style.height = '60px';
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorFollower.style.width = '40px';
        cursorFollower.style.height = '40px';
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
});

// ============================================
// Navigation
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Hamburger toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Scroll Indicator
// ============================================
const scrollIndicator = document.querySelector('.scroll-indicator-wrapper');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.visibility = 'hidden';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.visibility = 'visible';
        }
    });
}

// ============================================
// Animated Counter
// ============================================
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    };
    
    window.requestAnimationFrame(step);
}

// ============================================
// Intersection Observer for Animations
// ============================================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

// Fade in animation
const fadeElements = document.querySelectorAll('.feature-card, .vm-card, .content-block, .info-badge');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)';
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    fadeObserver.observe(element);
});

// Stats counter animation
const statsSection = document.querySelector('.stats');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            
            // Animate numbers
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, 0, target, 2000);
            });
            
            // Animate circles
            const circles = document.querySelectorAll('.stat-circle-progress');
            circles.forEach(circle => {
                const percent = parseInt(circle.getAttribute('data-percent'));
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (percent / 100) * circumference;
                
                setTimeout(() => {
                    circle.style.strokeDashoffset = offset;
                }, 100);
            });
        }
    });
}, { threshold: 0.3 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// ============================================
// Parallax Effect
// ============================================
const parallaxElements = document.querySelectorAll('.gradient-orb, .floating-card');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        const yPos = scrolled * speed;
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Mouse parallax for hero visual
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// ============================================
// 3D Tilt Effect for Cards
// ============================================
const tiltCards = document.querySelectorAll('[data-tilt]');

tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// ============================================
// Particle Animation
// ============================================
function createParticles() {
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(26, 107, 74, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `floatParticle ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesBg.appendChild(particle);
    }
}

// Add particle animation keyframes
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

createParticles();

// ============================================
// Scroll to Top Button
// ============================================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const circumference = 2 * Math.PI * 23;
    const offset = circumference - (scrollPercent / 100) * circumference;
    
    const progressCircle = scrollTopBtn.querySelector('circle');
    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
    
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// Contact Form
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Mengirim...</span>';
        submitBtn.disabled = true;
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Terkirim!</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        
        // Show notification
        showNotification('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.', 'success');
        
        // Reset form
        setTimeout(() => {
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    });
}

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: -400px;
        min-width: 300px;
        max-width: 400px;
        padding: 1.2rem 1.5rem;
        background: ${colors[type]};
        color: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
    `;
    
    const icon = notification.querySelector('i:first-child');
    icon.style.fontSize = '1.5rem';
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        margin-left: auto;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.right = '30px';
    }, 100);
    
    const removeNotification = () => {
        notification.style.right = '-400px';
        setTimeout(() => notification.remove(), 500);
    };
    
    closeBtn.addEventListener('click', removeNotification);
    setTimeout(removeNotification, 5000);
}

// ============================================
// Button Ripple Effect
// ============================================
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// ============================================
// Magnetic Button Effect
// ============================================
const magneticButtons = document.querySelectorAll('.btn-primary-hero, .btn-cta');

magneticButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// ============================================
// Typing Effect for Hero
// ============================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ============================================
// Image Lazy Loading
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Smooth Reveal on Scroll
// ============================================
const revealElements = document.querySelectorAll('.section-header, .about-container, .vm-container');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver.observe(element);
});

// ============================================
// Keyboard Navigation
// ============================================
document.addEventListener('keydown', (e) => {
    // ESC to close menu
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
    
    // Ctrl/Cmd + K to focus search (if you add search)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Add your search focus logic here
    }
});

// ============================================
// Performance Monitoring
// ============================================
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        
        console.log('%c🚀 Performance Stats', 'color: #1a6b4a; font-size: 16px; font-weight: bold;');
        console.log(`⚡ Page load time: ${loadTime.toFixed(0)}ms`);
        console.log(`📊 DOM Interactive: ${perfData.domInteractive.toFixed(0)}ms`);
        console.log(`🎨 DOM Complete: ${perfData.domComplete.toFixed(0)}ms`);
    });
}

// ============================================
// Console Branding
// ============================================
console.log('%c🌍 GEODUMP System', 'color: #1a6b4a; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
console.log('%c♻️ Smart Waste Monitoring Platform', 'color: #2d8f67; font-size: 16px; font-weight: 600;');
console.log('%c✨ Developed with love for a cleaner environment', 'color: #7f8c8d; font-size: 12px;');
console.log('%c🔧 Built with: HTML5, CSS3, Vanilla JavaScript', 'color: #95a5a6; font-size: 11px;');

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ GEODUMP website loaded successfully!');
    
    // Add any initialization code here
    updateActiveNav();
});

// ============================================
// Easter Egg - Konami Code
// ============================================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        showNotification('🎉 Kode Rahasia Aktif! Anda menemukan Easter Egg!', 'success');
        
        const rainbowStyle = document.createElement('style');
        rainbowStyle.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(rainbowStyle);
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});