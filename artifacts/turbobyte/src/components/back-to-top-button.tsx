import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER_SCROLL_Y = 420;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    // Scroll events cover normal browsing. The short fallback also catches
    // restored or programmatic scroll positions that some browsers apply
    // without dispatching a scroll event.
    const visibilityFallback = window.setInterval(updateVisibility, 250);

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.clearInterval(visibilityFallback);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-20 right-5 z-40 flex size-11 items-center justify-center rounded-full border border-primary/50 bg-primary text-white shadow-[0_10px_30px_hsl(var(--primary)/0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-[0_14px_36px_hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background md:bottom-8 md:right-8 md:size-12 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      data-testid="button-back-to-top"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}