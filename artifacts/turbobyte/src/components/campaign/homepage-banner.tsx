import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CAMPAIGN_ROUTE, campaignCopy } from '@/config/campaign';
import { useCampaignActive } from '@/hooks/use-campaign-active';
import { CountdownTimer } from './countdown-timer';

/** Homepage promo section linking to the Operation Tiranga campaign page. */
export function HomepageCampaignBanner() {
  const active = useCampaignActive();
  if (!active) return null;

  return (
    <section className="py-10 md:py-20 relative overflow-hidden" data-testid="section-homepage-campaign-banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl glassmorphism border-primary/30 overflow-hidden p-8 md:p-12"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF9933] via-white/40 to-[#138808]" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4 tracking-wide">
                🇮🇳 {campaignCopy.shortBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                Independence Day Offer: Websites from <span className="gradient-text">₹4,999</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl leading-relaxed">
                Premium websites, WhatsApp integration and AI automation for small businesses — with over ₹35,000 in launch bonuses. Live only till 15 August 2026.
              </p>
              <Button asChild size="lg" className="glow-purple" data-testid="button-homepage-banner-cta">
                <Link href={CAMPAIGN_ROUTE}>
                  <IndianRupee className="mr-1.5 w-4 h-4" /> See Operation Tiranga Offer <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 lg:border-l lg:border-white/10 lg:pl-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Offer ends in</span>
              <CountdownTimer />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
