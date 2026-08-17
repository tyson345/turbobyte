import { useEffect, useRef, useState } from 'react';
import { AnimatedGrid } from '@/components/animated-grid';

interface VantaEffect {
  destroy: () => void;
}

declare global {
  interface Window {
    VANTA?: {
      NET?: (options: Record<string, unknown>) => VantaEffect;
    };
    THREE?: unknown;
  }
}

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
const VANTA_NET_SRC = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js';

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/** Load an external script once; resolves when it's ready. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

/**
 * Vanta.js animated NET background.
 * Uses the CDN builds of three.js r134 + vanta.net (the versions Vanta was
 * built against) because the npm `three` in this project is far newer and
 * incompatible with the effect's materials.
 * - Destroys the WebGL instance on unmount to avoid leaks/duplicates.
 * - Falls back to a static grid when WebGL is unavailable or the user
 *   prefers reduced motion.
 */
export function VantaNet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFallback(true);
      return;
    }

    if (!supportsWebGL()) {
      setFallback(true);
      return;
    }

    let effect: VantaEffect | null = null;
    let cancelled = false;

    loadScript(THREE_SRC)
      .then(() => loadScript(VANTA_NET_SRC))
      .then(() => {
        if (cancelled) return;
        const NET = window.VANTA?.NET;
        if (!NET) {
          setFallback(true);
          return;
        }
        try {
          effect = NET({
            el,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x8e3fff,
            backgroundColor: 0x0,
            points: 9.0,
            maxDistance: 25.0,
            spacing: 16.0,
          });
        } catch {
          setFallback(true);
        }
      })
      .catch(() => setFallback(true));

    return () => {
      cancelled = true;
      effect?.destroy();
      effect = null;
    };
  }, []);

  if (fallback) {
    return <AnimatedGrid />;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden"
      data-testid="bg-vanta-net"
    />
  );
}
