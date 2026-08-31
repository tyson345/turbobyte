import { useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { serviceAnchor, type ServiceCategory } from '@/config/services';
import { MarketingImage } from '@/components/marketing-image';

/** SPA navigation doesn't auto-scroll to hash targets — do it manually. */
function useScrollToHash(deps: unknown[]) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Wait a tick so lazy content has rendered.
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const processSteps = [
  {
    step: '01',
    title: 'Discover',
    desc: 'We start with your goals: what you need, who it serves, and what success looks like. You get a clear scope, timeline, and plan before any build begins.',
  },
  {
    step: '02',
    title: 'Design',
    desc: 'We design the experience and architecture first — premium UI/UX, the right technology choices, and a structure that can grow with your business.',
  },
  {
    step: '03',
    title: 'Build',
    desc: 'We build in short, visible iterations with regular check-ins, so you see progress early and often — no black-box development.',
  },
  {
    step: '04',
    title: 'Launch & Support',
    desc: 'We test thoroughly, launch carefully, and stay with you after go-live with dedicated support and continuous improvements.',
  },
];

/**
 * Shared template for official service category pages. Mirrors the layout
 * and styling of the original service pages so the visual design stays
 * unchanged.
 */
export function ServiceCategoryPage({ category }: { category: ServiceCategory }) {
  useScrollToHash([category.slug]);
  useSEO(category.title, category.seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({
        path: `/services/${category.slug}`,
        title: category.title,
        description: category.seoDescription,
      }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: category.title, path: `/services/${category.slug}` },
      ]),
    ),
  });
  const Icon = category.icon;

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <Icon className="w-16 h-16 text-primary mb-6" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
              {category.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{category.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>What We Do</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                {category.intro.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <MarketingImage
                src="/images/marketing/design-workshop.jpg"
                alt="Strategy and planning session"
                aspectRatio="portrait"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services in this category */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
            Services We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {category.services.map((service, i) => (
              <Link key={i} href={`/services/${category.slug}/${serviceAnchor(service.name)}`} className="block group h-full">
                <motion.div
                  id={serviceAnchor(service.name)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.015] p-6 sm:p-8 md:p-10 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)] h-full flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full">
                    <CheckCircle className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-2xl font-medium mb-3 group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'var(--app-font-display)' }}>{service.name}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed mb-6 flex-1">{service.desc}</p>
                    <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-primary transition-colors mt-auto">
                      Explore service <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>
            Our <span className="gradient-text">Process</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {processSteps.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                  {phase.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>{phase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{phase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 glassmorphism" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tell us about your project and we'll respond within 24 business hours
          </p>
          <Link href="/start-project">
            <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-all glow-purple" data-testid="button-category-cta">
              Start Your Project <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
