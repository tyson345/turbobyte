import { siteConfig } from '@/config/site';
import logoMark from '@/assets/logo-mark.png';
import logoFull from '@/assets/logo-full.png';

interface LogoProps {
  className?: string;
  /**
   * 'horizontal' — brand mark + wordmark, for the navbar and tight spaces.
   * 'full' — the complete stacked logo, for the footer and error pages.
   */
  variant?: 'horizontal' | 'full';
}

export function Logo({ className = '', variant = 'horizontal' }: LogoProps) {
  if (variant === 'full') {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src={logoFull}
          alt={siteConfig.legalName}
          className="h-28 w-auto"
          data-testid="img-logo-full"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoMark}
        alt=""
        aria-hidden="true"
        className="h-8 w-auto"
        data-testid="img-logo-mark"
      />
      <span className="flex flex-col leading-none">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--app-font-display)' }}
        >
          <span className="text-white">Turbo</span>
          <span className="gradient-text">Byte</span>
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.35em] text-muted-foreground mt-0.5">
          Tech Solutions
        </span>
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </div>
  );
}
