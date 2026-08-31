import { motion, useReducedMotion } from 'framer-motion';
import { basePath } from '@/lib/paths';
import { cn } from '@/lib/utils';

interface MarketingPageBannerProps {
  compensateForPagePadding?: boolean;
}

export function MarketingPageBanner({
  compensateForPagePadding = true,
}: MarketingPageBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="TurboByte office"
      className={cn(
        'relative z-10 px-4 pt-24 sm:px-6 md:pt-28 lg:px-8',
        compensateForPagePadding && '-mb-20',
      )}
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative mx-auto h-44 max-w-7xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_24px_70px_-32px_rgba(86,54,103,0.55)] sm:h-56 md:h-64 lg:h-72"
      >
        <img
          src={`${basePath}/images/marketing/turbobyte-office-banner.webp`}
          alt="TurboByte office reception and workspace"
          width={1600}
          height={887}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/25 via-[#EADDEE]/10 to-[#C7B6DB]/30 mix-blend-color" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-background/10" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
      </motion.div>
    </section>
  );
}