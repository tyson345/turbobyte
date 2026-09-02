import { motion, useReducedMotion } from 'framer-motion';
import { marketingAssetUrl } from '@/lib/marketing-assets';

export function MarketingPageBanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="TurboByte office"
      className="relative z-10 w-full pt-16 sm:pt-20"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative h-32 w-full overflow-hidden border-y border-primary/20 bg-card shadow-[0_24px_70px_-32px_rgba(86,54,103,0.55)] sm:h-36 md:h-40 lg:h-44 xl:h-48"
      >
        <img
          src={marketingAssetUrl('/images/marketing/turbobyte-office-banner.webp')}
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