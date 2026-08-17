import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { ArrowRight, BarChart3, FileText, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListCaseStudies } from '@workspace/api-client-react';
import { AmbientHero } from '@/components/ambient-hero';

const anatomy = [
  {
    icon: Lightbulb,
    title: 'The Challenge',
    desc: 'The specific business problem the client faced — in plain terms, not tech jargon.',
  },
  {
    icon: FileText,
    title: 'Our Solution',
    desc: 'The approach we took, the architecture decisions we made, and why we made them.',
  },
  {
    icon: BarChart3,
    title: 'Verified Outcomes',
    desc: 'Measurable results tied to business value — revenue, efficiency, performance, or cost savings.',
  },
];

export default function CaseStudies() {
  const { data: caseStudies = [], isLoading } = useListCaseStudies();
  const seoTitle = 'Case Studies — Verified Results & Outcomes';
  const seoDescription =
    'In-depth case studies from TurboByte Tech Solutions — AI automation, full-stack platforms, and cloud infrastructure with verified, measurable outcomes.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/case-studies', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Case Studies', path: '/case-studies' },
      ]),
    ),
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <AmbientHero />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              Case Studies
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Deep dives into how we solve real client problems. Real numbers, honest context, and the
              full story — no success theatre.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Study Cards */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="space-y-6">
            {isLoading &&
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="glassmorphism rounded-2xl p-8 border border-white/10 animate-pulse motion-reduce:animate-none h-64"
                />
              ))}
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.015] rounded-[2.5rem] p-8 md:p-12 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-6 md:p-12 relative z-10">
                  {/* Left: content */}
                  <div className="flex-1">
                    <span className="inline-flex text-xs px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-medium tracking-wide">
                      {cs.category}
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4 leading-tight group-hover:text-primary transition-colors duration-300 tracking-tight"
                      style={{ fontFamily: 'var(--app-font-display)' }}
                    >
                      {cs.title}
                    </h2>
                    <p className="text-muted-foreground font-light leading-relaxed mb-8 text-lg">{cs.summary}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {cs.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/70 border border-white/10 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link href={`/case-studies/${cs.slug}`}>
                      <Button className="rounded-full bg-white text-black hover:bg-white/90 px-8 font-medium">
                        Read Full Case Study <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Right: metrics */}
                  <div className="flex md:flex-col gap-4 shrink-0 self-stretch md:w-48 lg:w-56">
                    <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 border border-primary/20 text-center flex-1 flex flex-col justify-center items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <TrendingUp className="w-5 h-5 text-primary mb-3" />
                      <div
                        className="text-3xl font-medium text-white mb-2"
                        style={{ fontFamily: 'var(--app-font-display)' }}
                      >
                        {cs.metricValue}
                      </div>
                      <div className="text-xs tracking-widest uppercase text-primary/70 font-semibold">{cs.metricLabel}</div>
                    </div>
                    {cs.secondaryMetricValue && (
                      <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 border border-white/10 text-center flex-1 flex flex-col justify-center items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <CheckCircle2 className="w-5 h-5 text-white/40 mb-3" />
                        <div
                          className="text-3xl font-medium text-white mb-2"
                          style={{ fontFamily: 'var(--app-font-display)' }}
                        >
                          {cs.secondaryMetricValue}
                        </div>
                        <div className="text-xs tracking-widest uppercase text-white/40 font-semibold">
                          {cs.secondaryMetricLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Anatomy of a Case Study */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              What's in{' '}
              <span className="gradient-text">Every Write-Up</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We don't publish success theatre. Each case study follows a structured format designed
              to give you a genuine picture of how we work.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {anatomy.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/[0.015] p-6 sm:p-8 md:p-10 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 mb-6">
                    <item.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3
                    className="text-2xl font-medium mb-3 tracking-tight text-white group-hover:text-primary transition-colors duration-300"
                    style={{ fontFamily: 'var(--app-font-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              Want to Be <span className="gradient-text">Case Study #2?</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Early clients get our founding team's undivided attention and our best rates.
              We deliver, document, and publish — building credibility together.
            </p>
            <Link href="/start-project">
              <Button size="lg" className="glow-purple">
                Start Your Project <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
