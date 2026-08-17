import { useEffect, useRef } from 'react';

export function AmbientHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      // Use parent's dimensions for responsive canvas sizing
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      return () => window.removeEventListener('resize', resize);
    }

    const particles: Array<{ x: number, y: number, vx: number, vy: number, size: number, opacity: number }> = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 70);
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, 
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    let rafId: number;
    let running = true;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!running) {
          running = true;
          draw();
        }
      } else {
        running = false;
      }
    });
    observer.observe(canvas);

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(142, 63, 255, ${p.opacity})`; // #8E3FFF
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 140;
          if (distSq < maxDist * maxDist) {
            const lineOpacity = (1 - Math.sqrt(distSq) / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(142, 63, 255, ${lineOpacity})`;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base dark plum/purple gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-80" />
      
      {/* Floating ambient glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-float opacity-50" />
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[#8e3fff]/10 rounded-full blur-[100px] mix-blend-screen animate-float opacity-40" style={{ animationDelay: '2s', animationDuration: '8s' }} />

      {/* Grid Pattern mask */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(142,63,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(142,63,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" 
        style={{ 
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 60%, transparent 100%)', 
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 60%, transparent 100%)' 
        }}
      />

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80 mix-blend-screen"
      />
      
      {/* Bottom fade out so it blends perfectly into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
