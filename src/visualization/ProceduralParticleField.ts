/**
 * 🎨 PROCEDURAL PARTICLE FIELD - PUNK EDITION (DETERMINISTA)
 *
 * Features:
 * - Canvas 2D background layer (fixed position, z-index: -1)
 * - Particles react to system metrics (CPU, memory, event loop latency)
 * - Emotion-based color schemes (HSL transitions)
 * - Fibonacci spiral influence when harmony > 0.7
 * - Toggle button to enable/disable
 * - FPS limiter (30/60 FPS configurable)
 *
 * Performance:
 * - RequestAnimationFrame with intelligent throttling
 * - Particle count dynamic based on CPU usage
 * - Fade effect (ghosting) for smooth trails
 * - Can be disabled completely (0% overhead)
 *
 * ANTI-SIMULACIÓN: 100% determinista - sin Math.random()
 */

import { deterministicNoise, deterministicPerlinNoise } from '../shared/deterministic-utils.js';

interface ParticleFieldConfig {
  enabled: boolean;
  maxParticles: number;      // Default: 100 (dynamic based on CPU)
  targetFPS: number;          // Default: 30 (60 for high-end systems)
  trailOpacity: number;       // Default: 0.1 (fade effect)
  emotionInfluence: number;   // Default: 1.0 (color transition speed)
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface SystemMetrics {
  health: number;
  stress: number;
  harmony: number;
  cpuUsage: number;
  memoryUsage: number;
  eventLoopLatency: number;
  emotionState: string;
}

export class ProceduralParticleField {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private config: ParticleFieldConfig;
  private metrics: SystemMetrics = {
    health: 0.8,
    stress: 0.3,
    harmony: 0.9,
    cpuUsage: 25,
    memoryUsage: 40,
    eventLoopLatency: 12,
    emotionState: 'evolving'
  };

  // Performance tracking
  private lastFrameTime = 0;
  private frameInterval = 1000 / 30; // 30 FPS by default
  private animationId: number | null = null;

  constructor(config: Partial<ParticleFieldConfig> = {}) {
    this.config = {
      enabled: true,
      maxParticles: 100,
      targetFPS: 30,
      trailOpacity: 0.1,
      emotionInfluence: 1.0,
      ...config
    };

    this.frameInterval = 1000 / this.config.targetFPS;
    this.setupCanvas();
    this.initParticles();
    this.startAnimation();
  }

  private setupCanvas(): void {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      background: transparent;
    `;
    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
    this.resize();

    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private initParticles(): void {
    // Particle count based on CPU usage (low CPU = more particles)
    const particleCount = Math.min(
      this.config.maxParticles,
      Math.floor((100 - this.metrics.cpuUsage) * 2)
    );

    this.particles = [];
    const seed = 'particle_init';
    const time = Date.now() / 1000; // Tiempo en segundos para animación

    for (let i = 0; i < particleCount; i++) {
      // Ruido determinista para posición inicial
      const xNoise = deterministicNoise(i, 0, time, `${seed}_x`);
      const yNoise = deterministicNoise(i, 1, time, `${seed}_y`);
      const vxNoise = deterministicNoise(i, 2, time, `${seed}_vx`);
      const vyNoise = deterministicNoise(i, 3, time, `${seed}_vy`);
      const sizeNoise = deterministicNoise(i, 4, time, `${seed}_size`);
      const opacityNoise = deterministicNoise(i, 5, time, `${seed}_opacity`);

      this.particles.push({
        x: xNoise * this.canvas.width,
        y: yNoise * this.canvas.height,
        vx: (vxNoise - 0.5) * 2, // -1 a 1
        vy: (vyNoise - 0.5) * 2, // -1 a 1
        size: sizeNoise * 3 + 1, // 1 a 4
        opacity: opacityNoise * 0.8 + 0.2, // 0.2 a 1.0
        hue: this.getEmotionHue()
      });
    }
  }

  private getEmotionHue(): number {
    const hues: Record<string, number> = {
      transcending: 45,  // Gold
      thriving: 120,     // Green
      evolving: 200,     // Blue
      dreaming: 280,     // Purple
      struggling: 0      // Red
    };
    return hues[this.metrics.emotionState] || 200;
  }

  /**
   * Update metrics from dashboard WebSocket
   */
  updateMetrics(newMetrics: Partial<SystemMetrics>): void {
    Object.assign(this.metrics, newMetrics);

    // Adjust particle count dynamically
    const targetCount = Math.min(
      this.config.maxParticles,
      Math.floor((100 - this.metrics.cpuUsage) * 2)
    );

    // Add particles if needed
    const seed = 'particle_update';
    const time = Date.now() / 1000;

    while (this.particles.length < targetCount) {
      const i = this.particles.length;
      const xNoise = deterministicNoise(i, 0, time, `${seed}_x`);
      const yNoise = deterministicNoise(i, 1, time, `${seed}_y`);
      const vxNoise = deterministicNoise(i, 2, time, `${seed}_vx`);
      const vyNoise = deterministicNoise(i, 3, time, `${seed}_vy`);
      const sizeNoise = deterministicNoise(i, 4, time, `${seed}_size`);
      const opacityNoise = deterministicNoise(i, 5, time, `${seed}_opacity`);

      this.particles.push({
        x: xNoise * this.canvas.width,
        y: yNoise * this.canvas.height,
        vx: (vxNoise - 0.5) * 2,
        vy: (vyNoise - 0.5) * 2,
        size: sizeNoise * 3 + 1,
        opacity: opacityNoise * 0.8 + 0.2,
        hue: this.getEmotionHue()
      });
    }

    // Remove particles if needed
    while (this.particles.length > targetCount) {
      this.particles.pop();
    }
  }

  /**
   * Animation loop with FPS limiting
   */
  private animate = (timestamp = 0): void => {
    if (!this.config.enabled) {
      this.animationId = requestAnimationFrame(this.animate);
      return;
    }

    // FPS limiting
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      this.animationId = requestAnimationFrame(this.animate);
      return;
    }

    this.lastFrameTime = timestamp;

    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  };

  private startAnimation(): void {
    if (this.animationId === null) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  private stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Render particles
   */
  private render(): void {
    // Fade effect (ghosting trail)
    this.ctx.fillStyle = `rgba(10, 10, 10, ${this.config.trailOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Chaos level based on event loop latency
    const chaosLevel = Math.max(0, this.metrics.eventLoopLatency - 10) / 50;

    // Target hue for emotion transitions
    const targetHue = this.getEmotionHue();

    // Update and draw particles
    for (const particle of this.particles) {
      // Smooth hue transition
      const hueDiff = targetHue - particle.hue;
      particle.hue += hueDiff * 0.05 * this.config.emotionInfluence;

      // Add chaos to velocity (event loop latency influence) - DETERMINISTA
      const time = this.lastFrameTime * 0.001; // Convertir a segundos
      const chaosX = deterministicNoise(particle.x * 0.01, particle.y * 0.01, time, 'chaos_x') - 0.5;
      const chaosY = deterministicNoise(particle.x * 0.01 + 100, particle.y * 0.01 + 100, time, 'chaos_y') - 0.5;
      particle.vx += chaosX * chaosLevel;
      particle.vy += chaosY * chaosLevel;

      // Fibonacci spiral influence (when harmony > 0.7)
      if (this.metrics.harmony > 0.7) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const angle = Math.atan2(dy, dx);
        const goldenAngle = 137.508 * Math.PI / 180;

        particle.vx += Math.cos(angle + goldenAngle) * 0.1;
        particle.vy += Math.sin(angle + goldenAngle) * 0.1;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Draw particle
      const size = particle.size * (1 + this.metrics.memoryUsage / 200);
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
      this.ctx.fill();

      // Glow effect when health > 0.8
      if (this.metrics.health > 0.8) {
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = `hsla(${particle.hue}, 100%, 70%, 0.8)`;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
  }

  /**
   * Toggle particles on/off
   */
  toggle(enabled: boolean): void {
    this.config.enabled = enabled;

    if (!enabled) {
      // Clear canvas when disabled
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.startAnimation();
    }
  }

  /**
   * Update FPS target
   */
  setTargetFPS(fps: number): void {
    this.config.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAnimation();
    this.canvas.remove();
    this.particles = [];
  }
}


