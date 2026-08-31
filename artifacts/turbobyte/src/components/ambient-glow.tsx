import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AmbientGlowProps extends HTMLAttributes<HTMLDivElement> {
  color?: 'primary' | 'lilac' | 'mixed';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export function AmbientGlow({ color = "mixed", position = "center", className, ...props }: AmbientGlowProps) {
  const colorClass = {
    primary: 'bg-primary/20',
    lilac: 'bg-[#DCBBE5]/20',
    mixed: 'bg-gradient-to-br from-primary/20 to-[#DCBBE5]/20'
  }[color];

  const positionClass = {
    'top-left': '-top-40 -left-40',
    'top-right': '-top-40 -right-40',
    'bottom-left': '-bottom-40 -left-40',
    'bottom-right': '-bottom-40 -right-40',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }[position];

  return (
    <div
      aria-hidden="true"
      className={cn(
        'ambient-glow pointer-events-none absolute -z-10 h-[min(600px,82vw)] w-[min(600px,82vw)] rounded-full opacity-50 blur-[90px] mix-blend-screen sm:blur-[120px]',
        colorClass,
        positionClass,
        className
      )}
      {...props}
    />
  );
}
