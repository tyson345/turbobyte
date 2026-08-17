import { useEffect, useState } from 'react';
import { isCampaignActive } from '@/config/campaign';

/**
 * Reactive campaign-window state. Re-evaluates every 30 seconds (and once
 * immediately) so campaign surfaces hide on their own the moment the offer
 * window closes, even if the page stays open across the deadline.
 */
export function useCampaignActive(): boolean {
  const [active, setActive] = useState(() => isCampaignActive());

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      if (!isCampaignActive()) {
        setActive(false);
        clearInterval(interval);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [active]);

  return active;
}
