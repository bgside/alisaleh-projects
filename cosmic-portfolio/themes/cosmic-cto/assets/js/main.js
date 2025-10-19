/**
 * Cosmic CTO Portfolio - Main JavaScript
 * Interactive galaxy background, particle system, and theme functionality
 */

// ==========================================================================
// Galaxy Background Canvas
// ==========================================================================

class GalaxyBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.animationId = null;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createStars();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createStars();
        });
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    createStars() {
        this.stars = [];
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 8000);

        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width / window.devicePixelRatio,
                y: Math.random() * this.canvas.height / window.devicePixelRatio,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 35, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Draw and animate stars
        this.stars.forEach((star, index) => {
            // Update star opacity for twinkling effect
            star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.1;

            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 255, 136, ${Math.max(0, Math.min(1, star.opacity))})`;
            this.ctx.fill();

            // Add glow effect for brighter stars
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 255, 136, ${Math.max(0, Math.min(0.3, star.opacity * 0.3))})`;
                this.ctx.fill();
            }
        });

        // Draw nebula-like clouds
        this.drawNebula();
    }

    drawNebula() {
        const time = Date.now() * 0.001;

        // Create gradient for nebula effect
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / (window.devicePixelRatio * 2) + Math.sin(time) * 100,
            this.canvas.height / (window.devicePixelRatio * 2) + Math.cos(time) * 100,
            0,
            this.canvas.width / (window.devicePixelRatio * 2),
            this.canvas.height / (window.devicePixelRatio * 2),
            200
        );

        gradient.addColorStop(0, 'rgba(45, 27, 105, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 180, 216, 0.2)');
        gradient.addColorStop(1, 'rgba(10, 10, 35, 0.1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ==========================================================================
// Particle System
// ==========================================================================

class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.animationId = null;

        this.init();
    }

    init() {
        this.createParticles();
        this.animate();

        // Handle mouse movement for interactive particles
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    createParticles() {
        this.particles = [];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.6 + 0.2,
                hue: Math.random() * 60 + 120 // Green to blue range
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

            // Draw particle
            const element = document.createElement('div');
            element.className = 'particle';
            element.style.left = particle.x + 'px';
            element.style.top = particle.y + 'px';
            element.style.width = particle.size + 'px';
            element.style.height = particle.size + 'px';
            element.style.background = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
            element.style.boxShadow = `0 0 ${particle.size * 2}px hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;

            // Clear previous particles and add new one
            this.container.innerHTML = '';
            this.container.appendChild(element);
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Attract particles to mouse
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                particle.vx += dx * 0.0001;
                particle.vy += dy * 0.0001;
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.container.innerHTML = '';
    }
}

// ==========================================================================
// Theme Toggle Functionality
// ==========================================================================

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
    }
}

// ==========================================================================
// Smooth Scrolling for Navigation Links
// ==========================================================================

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================================================
// Intersection Observer for Animations
// ==========================================================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ==========================================================================
// Performance Monitoring
// ==========================================================================

function initPerformanceMonitoring() {
    // Monitor FPS for background animations
    let frameCount = 0;
    let lastTime = performance.now();

    function monitorFPS() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

            // Reduce particle count if FPS is low
            if (fps < 30 && window.particleSystem && window.particleSystem.particles.length > 25) {
                console.log('Low FPS detected, reducing particle count');
                // Recreate particles with fewer count
                window.particleSystem.particles = window.particleSystem.particles.slice(0, 25);
            }

            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(monitorFPS);
    }

    monitorFPS();
}

// ==========================================================================
// Initialize Everything
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize galaxy background
    window.galaxyBackground = new GalaxyBackground('galaxyCanvas');

    // Initialize particle system
    window.particleSystem = new ParticleSystem('particles');

    // Load saved theme
    loadTheme();

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    console.log('🌌 Cosmic CTO Portfolio initialized successfully!');
});

// ==========================================================================
// Error Handling
// ==========================================================================

window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);

    // Gracefully degrade if WebGL/Canvas fails
    if (e.error.message.includes('WebGL') || e.error.message.includes('canvas')) {
        console.log('Canvas not supported, disabling background effects');
        const canvas = document.getElementById('galaxyCanvas');
        if (canvas) canvas.style.display = 'none';
    }
});

// ==========================================================================
// Accessibility Enhancements
// ==========================================================================

// Respect user's motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// ==========================================================================
// Export for potential external use
// ==========================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GalaxyBackground,
        ParticleSystem,
        toggleTheme
    };
}
