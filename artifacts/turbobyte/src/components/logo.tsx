import { siteConfig } from '@/config/site';
import logoMark from '@/assets/logo-official-mark.png';
import logoWordmark from '@/assets/logo-official-wordmark.png';
import logoTechSolutions from '@/assets/logo-official-tech.png';

interface LogoProps {
  className?: string;
  size?: 'nav' | 'footer';
  /**
   * 'horizontal' — brand mark + wordmark, for the navbar and tight spaces.
   * 'full' — the complete stacked logo, for the footer and error pages.
   */
  variant?: 'horizontal' | 'full';
}

export function Logo({ className = '', variant = 'horizontal', size = 'nav' }: LogoProps) {
  if (variant === 'full') {
    return (
      <div
        className={`flex w-full max-w-xs flex-col items-center ${className}`}
        role="img"
        aria-label={siteConfig.legalName}
        data-testid="img-logo-full"
      >
        <img
          src={logoMark}
          alt=""
          aria-hidden="true"
          className="block h-auto w-1/2"
        />
        <img
          src={logoWordmark}
          alt=""
          aria-hidden="true"
          className="mt-3 block h-auto w-full"
        />
        <img
          src={logoTechSolutions}
          alt=""
          aria-hidden="true"
          className="mt-3 block h-auto w-3/4 brightness-0 invert"
        />
      </div>
    );
  }

  const isFooter = size === 'footer';

  return (
    <div
      className={`flex items-center gap-2 ${
        isFooter
          ? 'w-full max-w-[22rem]'
          : 'w-[12rem] max-w-[calc(100vw-6rem)] sm:w-[13.75rem]'
      } ${className}`}
      role="img"
      aria-label={siteConfig.name}
      data-testid="img-logo-horizontal"
    >
      <img
        src={logoMark}
        alt=""
        aria-hidden="true"
        className="block h-auto w-[25%] shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col items-center">
        <img
          src={logoWordmark}
          alt=""
          aria-hidden="true"
          className="block h-auto w-full"
        />
        <img
          src={logoTechSolutions}
          alt=""
          aria-hidden="true"
          className="mt-1 block h-auto w-[74.5%] brightness-0 invert"
        />
      </span>
    </div>
  );
}
