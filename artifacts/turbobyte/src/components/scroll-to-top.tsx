import { useLayoutEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
  const [pathname] = useLocation();

  useLayoutEffect(() => {
    // Scroll to top instantly on pathname change
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'instant' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
