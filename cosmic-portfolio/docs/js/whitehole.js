/**
 * Advanced WebGL Black Hole Portfolio Background
 * Realistic gravitational lensing with WebGL shaders
 */

// WebGL Black Hole Background System
class WebGLBlackHoleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById('glscreen');
        this.gl = null;
        this.program = null;
        this.buffer = null;
        this.texture = null;
        this.startTime = new Date().getTime();
        this.currentTime = 0;
        this.mouse = { x: 0, y: 0 };
        this.blackholeMass = 1500;
        this.curblackholeMass = 0;
        this.clicked = false;
        this.clickedTime = 0;

        this.init();
    }

    init() {
        // Initialize WebGL
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.resizeCanvas();
        this.createShaders();
        this.createBuffers();
        this.createTexture();
        this.render();

        // Event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', () => this.clicked = true);
        document.addEventListener('mouseup', () => this.clicked = false);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Update resolution uniform
        if (this.program) {
            const locationOfResolution = this.gl.getUniformLocation(this.program, "u_resolution");
            this.gl.uniform2f(locationOfResolution, this.canvas.width, this.canvas.height);
        }
    }

    createShaders() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                v_texCoord = a_texCoord;
            }
        `;

        // Fragment shader (from user's code)
        const fragmentShaderSource = `
            #ifdef GL_ES
            precision mediump float;
            #endif

            #define PI 3.14159265359

            uniform sampler2D u_image;
            varying vec2 v_texCoord;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_mass;
            uniform float u_time;
            uniform float u_clickedTime;

            vec2 rotate(vec2 mt, vec2 st, float angle){
                float cos = cos((angle + u_clickedTime) * PI);
                float sin = sin(angle * 0.0);

                float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;
                float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;
                return vec2(nx, ny);
            }

            void main() {
                vec2 st = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y)/u_resolution;
                vec2 mt = vec2(u_mouse.x, u_resolution.y - u_mouse.y)/u_resolution;

                float dx = st.x - mt.x;
                float dy = st.y - mt.y;
                float dist = sqrt(dx * dx + dy * dy);
                float pull = u_mass / (dist * dist);

                vec3 color = vec3(0.0);

                vec2 r = rotate(mt, st, pull);
                vec4 imgcolor = texture2D(u_image, r);
                color = vec3(
                    (imgcolor.x - (pull * 0.25)),
                    (imgcolor.y - (pull * 0.25)),
                    (imgcolor.z - (pull * 0.25))
                );

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // Create and compile shaders
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);

        this.gl.compileShader(vertexShader);
        this.gl.compileShader(fragmentShader);

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        // Get uniform locations
        this.locationOfTime = this.gl.getUniformLocation(this.program, "u_time");
        this.locationOfResolution = this.gl.getUniformLocation(this.program, "u_resolution");
        this.locationOfMouse = this.gl.getUniformLocation(this.program, "u_mouse");
        this.locationOfMass = this.gl.getUniformLocation(this.program, "u_mass");
        this.locationOfclickedTime = this.gl.getUniformLocation(this.program, "u_clickedTime");
    }

    createBuffers() {
        // Create buffer for rectangle
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                1.0, 1.0
            ]),
            this.gl.STATIC_DRAW
        );

        // Set up attributes
        const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Texture coordinates
        const texCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
        const texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                0.0, 1.0,
                1.0, 1.0,
                0.0, 0.0,
                0.0, 0.0,
                1.0, 1.0,
                1.0, 0.0
            ]),
            this.gl.STATIC_DRAW
        );
        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    createTexture() {
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        // Set texture parameters
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        // Create a simple cosmic background pattern
        const width = 512;
        const height = 512;
        const imageData = new Uint8Array(width * height * 4);

        for (let i = 0; i < width * height; i++) {
            const x = (i % width) / width;
            const y = Math.floor(i / width) / height;

            // Create a cosmic-looking background
            const dx = x - 0.5;
            const dy = y - 0.5;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Stars and nebula effect
            const starField = Math.sin(x * 100) * Math.cos(y * 100) * 0.5 + 0.5;
            const nebula = Math.sin(x * 10) * Math.cos(y * 8) * 0.3 + 0.7;

            imageData[i * 4] = Math.floor(starField * nebula * 100 + 50);     // R
            imageData[i * 4 + 1] = Math.floor(starField * nebula * 150 + 100); // G
            imageData[i * 4 + 2] = Math.floor(starField * nebula * 200 + 150); // B
            imageData[i * 4 + 3] = 255; // A
        }

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            width,
            height,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            imageData
        );
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = this.canvas.height - e.clientY; // Flip Y coordinate
    }

    render() {
        const now = new Date().getTime();
        this.currentTime = (now - this.startTime) / 1000;

        // Update black hole mass
        if (this.curblackholeMass < this.blackholeMass - 50) {
            this.curblackholeMass += (this.blackholeMass - this.curblackholeMass) * 0.03;
        }

        // Update click effect
        if (this.clicked) {
            this.clickedTime += 0.03;
        } else if (this.clickedTime > 0) {
            this.clickedTime += -(this.clickedTime * 0.015);
        }

        // Update uniforms
        this.gl.uniform1f(this.locationOfMass, this.curblackholeMass * 0.00001);
        this.gl.uniform2f(this.locationOfMouse, this.mouse.x, this.mouse.y);
        this.gl.uniform1f(this.locationOfTime, this.currentTime);
        this.gl.uniform1f(this.locationOfclickedTime, this.clickedTime);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        requestAnimationFrame(() => this.render());
    }

    destroy() {
        if (this.gl) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteBuffer(this.buffer);
            this.gl.deleteTexture(this.texture);
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
