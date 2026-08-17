import { useEffect, useRef, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isOver: boolean;
}

function computeParts(targetMs: number): CountdownParts {
  const totalMs = Math.max(0, targetMs - Date.now());
  const isOver = totalMs <= 0;
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);
  return { days, hours, minutes, seconds, totalMs, isOver };
}

/**
 * Efficient single-interval countdown to a fixed target date/time.
 * Automatically stops ticking once the target has passed.
 */
export function useCountdown(targetDate: string): CountdownParts {
  const targetMsRef = useRef(new Date(targetDate).getTime());
  const [parts, setParts] = useState<CountdownParts>(() => computeParts(targetMsRef.current));

  useEffect(() => {
    if (computeParts(targetMsRef.current).isOver) return;

    const interval = setInterval(() => {
      setParts((prev) => {
        const next = computeParts(targetMsRef.current);
        if (next.isOver) {
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return parts;
}
