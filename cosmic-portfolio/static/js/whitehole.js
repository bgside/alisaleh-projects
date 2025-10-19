/**
 * White Hole Portfolio - Interactive Background System
 * Opposite of black hole - particles flow outward with bright, expansive effects
 */

// ==========================================================================
// White Hole Background System
// ==========================================================================

class WhiteHoleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = 0;
        this.centerY = 0;
        this.whiteHoleRadius = 80;
        this.expansionRings = [];
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
        this.createWhiteHole();
        this.createExpansionRings();
        this.createParticles();
        this.createStars();
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createWhiteHole();
            this.createExpansionRings();
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

        // Position white hole (dynamic position if reactive)
        if (this.reactive) {
            this.centerX = rect.width * 0.4 + (Math.random() - 0.5) * rect.width * 0.3;
            this.centerY = rect.height * 0.4 + (Math.random() - 0.5) * rect.height * 0.3;
        } else {
            this.centerX = rect.width / 2;
            this.centerY = rect.height / 2;
        }
    }

    createWhiteHole() {
        // White hole core - bright center
        this.whiteHoleRadius = Math.min(this.canvas.width, this.canvas.height) / 15;
    }

    createExpansionRings() {
        this.expansionRings = [];
        const numRings = 40;

        for (let i = 0; i < numRings; i++) {
            const radius = this.whiteHoleRadius + (i * 8);
            const particles = Math.floor((2 * Math.PI * radius) / 12);

            for (let j = 0; j < particles; j++) {
                const angle = (j / particles) * Math.PI * 2;
                this.expansionRings.push({
                    x: this.centerX + Math.cos(angle) * radius,
                    y: this.centerY + Math.sin(angle) * radius,
                    angle: angle,
                    radius: radius,
                    expansionSpeed: 0.03 / (radius * 0.005 + 1),
                    opacity: Math.max(0.2, 1 - (radius - this.whiteHoleRadius) / 200),
                    hue: (i / numRings) * 120 + 180, // Cyan to green range
                    size: Math.max(2, 6 - (radius - this.whiteHoleRadius) / 40),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    createParticles() {
        this.particles = [];
        const numParticles = this.reactive ? 100 : 70;

        for (let i = 0; i < numParticles; i++) {
            // Start particles from white hole center
            const startAngle = Math.random() * Math.PI * 2;
            const startDistance = this.whiteHoleRadius + Math.random() * 50;

            this.particles.push({
                x: this.centerX + Math.cos(startAngle) * startDistance,
                y: this.centerY + Math.sin(startAngle) * startDistance,
                vx: Math.cos(startAngle) * (2 + Math.random() * 3),
                vy: Math.sin(startAngle) * (2 + Math.random() * 3),
                size: Math.random() * 4 + 2,
                opacity: Math.random() * 0.9 + 0.1,
                hue: Math.random() * 120 + 160, // Cyan to green
                expanded: false,
                creationTime: Date.now(),
                lifeSpan: 3000 + Math.random() * 4000
            });
        }
    }

    createStars() {
        this.stars = [];
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 4000);

        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width / window.devicePixelRatio,
                y: Math.random() * this.canvas.height / window.devicePixelRatio,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 1 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                hue: Math.random() * 60 + 180, // Bright cyan to blue
                brightness: 0.8 + Math.random() * 0.4
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(248, 250, 252, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Update and draw expansion rings
        this.updateExpansionRings();

        // Update and draw particles
        this.updateParticles();

        // Draw stars
        this.drawStars();

        // Draw white hole
        this.drawWhiteHole();

        // Draw expansion field effect
        this.drawExpansionField();
    }

    updateExpansionRings() {
        this.expansionRings.forEach(ring => {
            // Expand outward from white hole
            ring.radius += ring.expansionSpeed * 20;

            // Update angle for rotation
            ring.angle += ring.expansionSpeed * 2;

            // Calculate new position
            ring.x = this.centerX + Math.cos(ring.angle) * ring.radius;
            ring.y = this.centerY + Math.sin(ring.angle) * ring.radius;

            // Pulsing effect
            const pulse = Math.sin(Date.now() * 0.003 + ring.pulsePhase) * 0.3 + 0.7;
            ring.opacity = Math.max(0.1, (1 - (ring.radius - this.whiteHoleRadius) / 300) * pulse);

            // Draw expansion ring particle
            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${ring.hue}, 85%, 65%, ${ring.opacity})`;
            this.ctx.fill();

            // Outer glow effect
            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.size * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${ring.hue}, 85%, 65%, ${ring.opacity * 0.2})`;
            this.ctx.fill();

            // Remove particles that are too far
            if (ring.radius > Math.max(this.canvas.width, this.canvas.height) / window.devicePixelRatio) {
                ring.radius = this.whiteHoleRadius;
            }
        });
    }

    updateParticles() {
        const currentTime = Date.now();

        this.particles.forEach((particle, index) => {
            if (particle.expanded) return;

            // Update position (moving outward)
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Check if particle is too far from white hole
            const dx = particle.x - this.centerX;
            const dy = particle.y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > Math.max(this.canvas.width, this.canvas.height) / window.devicePixelRatio) {
                particle.expanded = true;
                return;
            }

            // Mouse interaction (if reactive)
            if (this.reactive) {
                const mouseDx = this.mouseX - particle.x;
                const mouseDy = this.mouseY - particle.y;
                const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                if (mouseDistance < 200) {
                    const repulsion = (200 - mouseDistance) / 200;
                    particle.vx += (mouseDx / mouseDistance) * repulsion * 0.02;
                    particle.vy += (mouseDy / mouseDistance) * repulsion * 0.02;
                }
            }

            // Draw particle with trail
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 95%, 70%, ${particle.opacity})`;
            this.ctx.fill();

            // Bright trail effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x - particle.vx * 3, particle.y - particle.vy * 3, particle.size * 0.7, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 95%, 70%, ${particle.opacity * 0.6})`;
            this.ctx.fill();

            // Outer glow
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 95%, 70%, ${particle.opacity * 0.15})`;
            this.ctx.fill();
        });

        // Remove expanded particles
        this.particles = this.particles.filter(p => !p.expanded);
    }

    drawStars() {
        const time = Date.now() * 0.001;

        this.stars.forEach(star => {
            // Update opacity for twinkling with brightness variation
            const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
            star.opacity = (Math.random() * 0.3 + 0.7) * star.brightness * twinkle;

            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${star.hue}, 80%, 90%, ${Math.max(0.2, Math.min(1, star.opacity))})`;
            this.ctx.fill();

            // Star corona effect
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${star.hue}, 80%, 90%, ${Math.max(0, Math.min(0.3, star.opacity * 0.3))})`;
                this.ctx.fill();
            }
        });
    }

    drawWhiteHole() {
        // White hole core - bright center
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.whiteHoleRadius * 3
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(240, 253, 255, 0.9)');
        gradient.addColorStop(0.6, 'rgba(186, 230, 253, 0.6)');
        gradient.addColorStop(0.8, 'rgba(125, 211, 252, 0.3)');
        gradient.addColorStop(1, 'rgba(125, 211, 252, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.whiteHoleRadius * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner bright core
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.whiteHoleRadius * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fill();

        // Event horizon ring (opposite of black hole - bright instead of dark)
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.whiteHoleRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Ergosphere (expansion zone)
        this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.whiteHoleRadius * 1.8, 0, Math.PI * 2);
        this.ctx.stroke();

        // Outer energy field
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.whiteHoleRadius * 2.5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawExpansionField() {
        // Create expansion field visualization
        const time = Date.now() * 0.002;

        // Multiple expansion waves
        for (let wave = 0; wave < 3; wave++) {
            const waveRadius = this.whiteHoleRadius * 2 + (wave * 100) + Math.sin(time + wave) * 30;
            const waveOpacity = Math.max(0, 0.3 - (wave * 0.08));

            const waveGradient = this.ctx.createRadialGradient(
                this.centerX, this.centerY, waveRadius - 20,
                this.centerX, this.centerY, waveRadius + 20
            );

            waveGradient.addColorStop(0, `rgba(6, 182, 212, ${waveOpacity})`);
            waveGradient.addColorStop(0.5, `rgba(16, 185, 129, ${waveOpacity * 0.5})`);
            waveGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

            this.ctx.strokeStyle = waveGradient;
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, waveRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ==========================================================================
// Particle System Enhancement
// ==========================================================================

class EnhancedParticleSystem {
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
        const numParticles = 60;

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 2,
                opacity: Math.random() * 0.7 + 0.3,
                hue: Math.random() * 60 + 160, // Cyan to green range
                pulseSpeed: Math.random() * 0.02 + 0.01,
                baseSize: Math.random() * 3 + 2
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update and draw particles
        this.particles.forEach(particle => {
            // Pulsing effect
            const pulse = Math.sin(Date.now() * particle.pulseSpeed) * 0.3 + 0.7;
            particle.size = particle.baseSize * pulse;

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
            element.style.background = `hsla(${particle.hue}, 80%, 70%, ${particle.opacity})`;
            element.style.boxShadow = `0 0 ${particle.size * 3}px hsla(${particle.hue}, 80%, 70%, ${particle.opacity * 0.6})`;

            // Clear previous particles and add new one
            this.container.innerHTML = '';
            this.container.appendChild(element);
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Gentle attraction to mouse
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const attraction = (150 - distance) / 150;
                particle.vx += (dx / distance) * attraction * 0.01;
                particle.vy += (dy / distance) * attraction * 0.01;
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
// Initialize Everything
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize white hole background
    window.whiteholeBackground = new WhiteHoleBackground('whiteholeCanvas');

    // Initialize enhanced particle system
    window.enhancedParticles = new EnhancedParticleSystem('particles');

    console.log('🌟 White Hole Portfolio initialized successfully!');
});

// ==========================================================================
// Error Handling
// ==========================================================================

window.addEventListener('error', (e) => {
    console.error('White Hole Portfolio Error:', e.error);

    // Gracefully degrade if Canvas fails
    if (e.error.message.includes('Canvas') || e.error.message.includes('WebGL')) {
        console.log('Canvas not supported, disabling background effects');
        const canvas = document.getElementById('whiteholeCanvas');
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

// ==========================================================================
// Performance Monitoring
// ==========================================================================

function initPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    function monitorFPS() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

            // Reduce particle count if FPS is low
            if (fps < 30 && window.enhancedParticles && window.enhancedParticles.particles.length > 30) {
                console.log('Optimizing performance - reducing particle count');
                window.enhancedParticles.particles = window.enhancedParticles.particles.slice(0, 30);
            }

            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(monitorFPS);
    }

    monitorFPS();
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    initPerformanceMonitoring();
});
