import { useEffect, useRef } from 'react';

/**
 * Animated particle-grid background.
 * Performance notes:
 * - The static grid is pre-rendered to an offscreen canvas (redrawn only on resize).
 * - Particle glows are pre-rendered to a small sprite (no per-frame gradients).
 * - The rAF loop is cancelled on unmount, paused when the canvas is offscreen
 *   or the tab is hidden, and skipped entirely for reduced-motion users.
 */
export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Offscreen layer with the static grid lines.
    const gridLayer = document.createElement('canvas');

    const drawGridLayer = () => {
      gridLayer.width = canvas.width;
      gridLayer.height = canvas.height;
      const gctx = gridLayer.getContext('2d');
      if (!gctx) return;
      gctx.strokeStyle = 'rgba(124, 58, 237, 0.1)';
      gctx.lineWidth = 1;
      const gridSize = 50;
      gctx.beginPath();
      for (let x = 0; x < gridLayer.width; x += gridSize) {
        gctx.moveTo(x, 0);
        gctx.lineTo(x, gridLayer.height);
      }
      for (let y = 0; y < gridLayer.height; y += gridSize) {
        gctx.moveTo(0, y);
        gctx.lineTo(gridLayer.width, y);
      }
      gctx.stroke();
    };

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawGridLayer();
      if (reducedMotion) {
        // Static render: grid only, no animation loop.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gridLayer, 0, 0);
      }
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    if (reducedMotion) {
      return () => window.removeEventListener('resize', setCanvasSize);
    }

    // Pre-rendered glow sprite (one gradient, reused for every particle).
    const SPRITE_SIZE = 64;
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const half = SPRITE_SIZE / 2;
      const gradient = sctx.createRadialGradient(half, half, 0, half, half, half);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
      sctx.fillStyle = gradient;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      sctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
      sctx.beginPath();
      sctx.arc(half, half, 2, 0, Math.PI * 2);
      sctx.fill();
    }

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    let rafId = 0;
    let running = false;
    let visibleInViewport = true;

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(gridLayer, 0, 0);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const drawSize = particle.size * 20;
        ctx.drawImage(
          sprite,
          particle.x - drawSize / 2,
          particle.y - drawSize / 2,
          drawSize,
          drawSize,
        );
      }

      rafId = requestAnimationFrame(animate);
    };

    const updateRunning = () => {
      const shouldRun = visibleInViewport && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        rafId = requestAnimationFrame(animate);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      visibleInViewport = entries[0]?.isIntersecting ?? true;
      updateRunning();
    });
    observer.observe(canvas);

    const onVisibilityChange = () => updateRunning();
    document.addEventListener('visibilitychange', onVisibilityChange);

    updateRunning();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
