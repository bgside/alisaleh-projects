/**
 * Cosmic CTO Portfolio - Advanced Black Hole Background System
 * Interactive black hole with accretion disk, reactive particles, and cosmic effects
 */

// ==========================================================================
// Black Hole Background System
// ==========================================================================

class BlackHoleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = 0;
        this.centerY = 0;
        this.blackHoleRadius = 50;
        this.accretionDisk = [];
        this.particles = [];
        this.stars = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.reactive = true;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createBlackHole();
        this.createAccretionDisk();
        this.createParticles();
        this.createStars();
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createBlackHole();
            this.createAccretionDisk();
            this.createParticles();
            this.createStars();
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Disable reactivity for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.reactive = false;
        }
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Position black hole (avoid center if reactive)
        if (this.reactive) {
            this.centerX = rect.width * 0.3 + (Math.random() - 0.5) * rect.width * 0.4;
            this.centerY = rect.height * 0.3 + (Math.random() - 0.5) * rect.height * 0.4;
        } else {
            this.centerX = rect.width / 2;
            this.centerY = rect.height / 2;
        }
    }

    createBlackHole() {
        // Black hole core with event horizon
        this.blackHoleRadius = Math.min(this.canvas.width, this.canvas.height) / 20;
    }

    createAccretionDisk() {
        this.accretionDisk = [];
        const numRings = 60;

        for (let i = 0; i < numRings; i++) {
            const radius = this.blackHoleRadius + (i * 3);
            const particles = Math.floor((2 * Math.PI * radius) / 8);

            for (let j = 0; j < particles; j++) {
                const angle = (j / particles) * Math.PI * 2;
                this.accretionDisk.push({
                    x: this.centerX + Math.cos(angle) * radius,
                    y: this.centerY + Math.sin(angle) * radius,
                    angle: angle,
                    radius: radius,
                    speed: 0.02 / (radius * 0.01),
                    opacity: Math.max(0.1, 1 - (radius - this.blackHoleRadius) / 100),
                    hue: (i / numRings) * 60 + 240, // Blue to purple range
                    size: Math.max(1, 3 - (radius - this.blackHoleRadius) / 30)
                });
            }
        }
    }

    createParticles() {
        this.particles = [];
        const numParticles = this.reactive ? 80 : 50;

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.max(this.canvas.width, this.canvas.height);

            this.particles.push({
                x: this.centerX + Math.cos(angle) * distance,
                y: this.centerY + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                hue: Math.random() * 60 + 200, // Blue to purple
                suckedIn: false,
                spiralSpeed: Math.random() * 0.05 + 0.02
            });
        }
    }

    createStars() {
        this.stars = [];
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 6000);

        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width / window.devicePixelRatio,
                y: Math.random() * this.canvas.height / window.devicePixelRatio,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.9 + 0.1,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                hue: Math.random() * 60 + 180 // Cyan to blue
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Clear with fade effect for trail
        this.ctx.fillStyle = 'rgba(5, 5, 15, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Update and draw accretion disk
        this.updateAccretionDisk();

        // Update and draw particles
        this.updateParticles();

        // Draw stars
        this.drawStars();

        // Draw black hole
        this.drawBlackHole();

        // Draw gravitational lensing effect
        this.drawGravitationalLensing();
    }

    updateAccretionDisk() {
        this.accretionDisk.forEach(particle => {
            // Rotate around black hole
            particle.angle += particle.speed;

            // Calculate new position
            particle.x = this.centerX + Math.cos(particle.angle) * particle.radius;
            particle.y = this.centerY + Math.sin(particle.angle) * particle.radius;

            // Draw accretion disk particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
            this.ctx.fill();

            // Add glow effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity * 0.3})`;
            this.ctx.fill();
        });
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            if (particle.suckedIn) return;

            const dx = this.centerX - particle.x;
            const dy = this.centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Black hole gravity effect
            if (distance < 200) {
                const force = (200 - distance) / 200;
                particle.vx += (dx / distance) * force * 0.1;
                particle.vy += (dy / distance) * force * 0.1;

                // Spiral into black hole
                if (distance < this.blackHoleRadius + 20) {
                    particle.suckedIn = true;
                    return;
                }
            }

            // Mouse interaction (if reactive)
            if (this.reactive) {
                const mouseDx = this.mouseX - particle.x;
                const mouseDy = this.mouseY - particle.y;
                const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                if (mouseDistance < 150) {
                    const repulsion = (150 - mouseDistance) / 150;
                    particle.vx -= (mouseDx / mouseDistance) * repulsion * 0.05;
                    particle.vy -= (mouseDy / mouseDistance) * repulsion * 0.05;
                }
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width / window.devicePixelRatio;
            if (particle.x > this.canvas.width / window.devicePixelRatio) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height / window.devicePixelRatio;
            if (particle.y > this.canvas.height / window.devicePixelRatio) particle.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 90%, 70%, ${particle.opacity})`;
            this.ctx.fill();

            // Particle trail
            this.ctx.beginPath();
            this.ctx.arc(particle.x - particle.vx * 2, particle.y - particle.vy * 2, particle.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 90%, 70%, ${particle.opacity * 0.5})`;
            this.ctx.fill();
        });

        // Remove sucked in particles
        this.particles = this.particles.filter(p => !p.suckedIn);
    }

    drawStars() {
        const time = Date.now() * 0.001;

        this.stars.forEach(star => {
            // Update opacity for twinkling
            star.opacity += Math.sin(time * star.twinkleSpeed) * 0.3;

            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${star.hue}, 70%, 80%, ${Math.max(0.1, Math.min(1, star.opacity))})`;
            this.ctx.fill();

            // Star glow
            if (star.size > 1.2) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${star.hue}, 70%, 80%, ${Math.max(0, Math.min(0.4, star.opacity * 0.4))})`;
                this.ctx.fill();
            }
        });
    }

    drawBlackHole() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.blackHoleRadius * 2
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(20, 20, 40, 0.9)');
        gradient.addColorStop(0.9, 'rgba(40, 40, 80, 0.4)');
        gradient.addColorStop(1, 'rgba(40, 40, 80, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.blackHoleRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Event horizon ring
        this.ctx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.blackHoleRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Ergosphere
        this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.blackHoleRadius * 1.5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawGravitationalLensing() {
        // Simulate light bending around black hole
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
        const data = imageData.data;

        for (let y = 0; y < this.canvas.height / window.devicePixelRatio; y += 2) {
            for (let x = 0; x < this.canvas.width / window.devicePixelRatio; x += 2) {
                const dx = x - this.centerX;
                const dy = y - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.blackHoleRadius && distance < this.blackHoleRadius * 3) {
                    // Bend light around black hole
                    const bendFactor = (this.blackHoleRadius * 3 - distance) / (this.blackHoleRadius * 2);
                    const bendAngle = Math.atan2(dy, dx) + bendFactor * 0.5;
                    const bentDistance = distance * (1 - bendFactor * 0.3);

                    const bentX = this.centerX + Math.cos(bendAngle) * bentDistance;
                    const bentY = this.centerY + Math.sin(bendAngle) * bentDistance;

                    if (bentX >= 0 && bentX < this.canvas.width / window.devicePixelRatio &&
                        bentY >= 0 && bentY < this.canvas.height / window.devicePixelRatio) {

                        const sourceIndex = (Math.floor(bentY) * (this.canvas.width / window.devicePixelRatio) + Math.floor(bentX)) * 4;
                        const targetIndex = (y * (this.canvas.width / window.devicePixelRatio) + x) * 4;

                        if (sourceIndex >= 0 && sourceIndex < data.length - 3) {
                            data[targetIndex] = data[sourceIndex] * 1.2;     // R
                            data[targetIndex + 1] = data[sourceIndex + 1] * 1.2; // G
                            data[targetIndex + 2] = data[sourceIndex + 2] * 1.2; // B
                            data[targetIndex + 3] = data[sourceIndex + 3];   // A
                        }
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
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
    // Initialize black hole background
    window.galaxyBackground = new BlackHoleBackground('galaxyCanvas');

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

    console.log('🕳️ Black Hole CTO Portfolio initialized successfully!');
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
