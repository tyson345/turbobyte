import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks/use-countdown';
import { CAMPAIGN_END_DATE } from '@/config/campaign';

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center" data-testid={`countdown-block-${label.toLowerCase()}`}>
      <div className="relative w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl glassmorphism border-primary/30 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <span
          className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums gradient-text"
          style={{ fontFamily: 'var(--app-font-display)' }}
        >
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const { days, hours, minutes, seconds, isOver } = useCountdown(CAMPAIGN_END_DATE);

  if (isOver) {
    return (
      <div
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-destructive/40 bg-destructive/10 text-destructive font-medium"
        data-testid="text-countdown-ended"
      >
        Offer has ended
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums text-primary" data-testid="text-countdown-compact">
        <span>{days}d</span>
        <span className="opacity-50">:</span>
        <span>{String(hours).padStart(2, '0')}h</span>
        <span className="opacity-50">:</span>
        <span>{String(minutes).padStart(2, '0')}m</span>
        <span className="opacity-50">:</span>
        <span>{String(seconds).padStart(2, '0')}s</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-3 sm:gap-4"
      data-testid="widget-countdown-timer"
    >
      <TimeBlock value={days} label="Days" />
      <span className="text-2xl sm:text-3xl text-primary/50 -mt-5">:</span>
      <TimeBlock value={hours} label="Hours" />
      <span className="text-2xl sm:text-3xl text-primary/50 -mt-5">:</span>
      <TimeBlock value={minutes} label="Mins" />
      <span className="text-2xl sm:text-3xl text-primary/50 -mt-5">:</span>
      <TimeBlock value={seconds} label="Secs" />
    </motion.div>
  );
}
