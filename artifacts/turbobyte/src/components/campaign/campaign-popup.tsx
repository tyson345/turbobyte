import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CAMPAIGN_ROUTE } from '@/config/campaign';
import { useCampaignActive } from '@/hooks/use-campaign-active';
import { CountdownTimer } from './countdown-timer';

const DISMISS_KEY = 'tiranga-popup-dismissed-v2';
/** Dismissal expires after 24h so returning visitors are gently reminded once a day. */
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

/** In-memory fallback so the popup stays dismissed for the session even when localStorage is unavailable. */
let sessionDismissed = false;

/**
 * One-time popup offering the Operation Tiranga campaign. Appears 8s after
 * mount, only while the campaign is active, and never again once dismissed
 * (tracked via localStorage, with an in-memory session fallback).
 */
export function CampaignPopup() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const active = useCampaignActive();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    let dismissed = sessionDismissed;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      dismissed = dismissed || (dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_TTL_MS);
    } catch {
      // localStorage unavailable — sessionDismissed fallback applies
    }
    if (dismissed) return;

    const timer = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(timer);
  }, [active]);

  // Focus management + Escape to dismiss while open.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    sessionDismissed = true;
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const claim = () => {
    dismiss();
    setLocation(CAMPAIGN_ROUTE);
  };

  if (!active) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          data-testid="overlay-campaign-popup"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-popup-heading"
            className="relative w-full max-w-md rounded-2xl glassmorphism border-primary/30 p-6 sm:p-8 overflow-hidden"
            data-testid="dialog-campaign-popup"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/25 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FF9933]/15 rounded-full blur-3xl" />

            <button
              ref={closeButtonRef}
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              aria-label="Close"
              data-testid="button-close-campaign-popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5" /> 🇮🇳 Operation Tiranga 2026
              </div>
              <h3 id="campaign-popup-heading" className="text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                Websites starting <span className="premium-gradient-text">₹4,999</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Our Independence Day offer ends 15 August. Claim your premium website, WhatsApp integration and free bonuses before the countdown hits zero.
              </p>
              <div className="mb-6 flex justify-center">
                <CountdownTimer compact />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 glow-purple" onClick={claim} data-testid="button-popup-claim">
                  Claim Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="flex-1 border-white/20" onClick={dismiss} data-testid="button-popup-dismiss">
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
