import { motion } from 'framer-motion';
import { Link, useParams } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCaseStudy } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { MarketingImage } from '@/components/marketing-image';

// Render markdown-style bold (**text**) within a paragraph string
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-foreground font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: cs, isLoading, error } = useGetCaseStudy(slug ?? '');

  const csPath = `/case-studies/${slug ?? ''}`;
  const csTitle = cs ? `${cs.title} — Case Study` : isLoading ? 'Loading Case Study…' : 'Case Study Not Found';
  useSEO(
    csTitle,
    cs ? cs.summary : 'This case study could not be found.',
    cs
      ? {
          jsonLd: schemaGraph(
            webPageSchema({ path: csPath, title: csTitle, description: cs.summary }),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Case Studies', path: '/case-studies' },
              { name: cs.title, path: csPath },
            ]),
          ),
        }
      : undefined,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-16 space-y-6">
          <div className="bg-white/[0.015] rounded-[2rem] h-40 border border-white/5 animate-pulse motion-reduce:animate-none" />
          <div className="bg-white/[0.015] rounded-[2rem] h-80 border border-white/5 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  if (error || !cs) return <NotFound />;

  const challengeParagraphs = cs.challenge.split('\n\n').filter(Boolean);
  const solutionParagraphs = cs.solution.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/case-studies">
          <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Case Studies
          </button>
        </Link>
      </div>

      {/* Hero */}
      <section className="py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-xs text-primary border border-primary/20 font-medium tracking-wide mb-6">
              {cs.category}
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              {cs.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-12">{cs.summary}</p>
            <MarketingImage
              src="/images/marketing/cloud-infrastructure.jpg"
              alt="Enterprise infrastructure deployment"
              aspectRatio="wide"
            />
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 text-center border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-3" />
              <div
                className="text-3xl font-medium text-white mb-2"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                {cs.metricValue}
              </div>
              <div className="text-xs tracking-widest uppercase font-semibold text-primary/70">{cs.metricLabel}</div>
            </div>
            {cs.secondaryMetricValue && (
              <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 text-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-center">
                <CheckCircle2 className="w-5 h-5 text-white/40 mx-auto mb-3" />
                <div
                  className="text-3xl font-medium text-white mb-2"
                  style={{ fontFamily: 'var(--app-font-display)' }}
                >
                  {cs.secondaryMetricValue}
                </div>
                <div className="text-xs tracking-widest uppercase font-semibold text-white/40">{cs.secondaryMetricLabel}</div>
              </div>
            )}
            <div className="bg-white/[0.015] rounded-[2rem] p-6 text-center border border-white/5 flex flex-col justify-center">
              <Clock className="w-5 h-5 text-white/40 mx-auto mb-3" />
              <div
                className="text-xl font-medium text-white mb-2"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                {cs.duration}
              </div>
              <div className="text-xs tracking-widest uppercase font-semibold text-white/40">Timeline</div>
            </div>
            <div className="bg-white/[0.015] rounded-[2rem] p-6 text-center border border-white/5 flex flex-col justify-center">
              <Calendar className="w-5 h-5 text-white/40 mx-auto mb-3" />
              <div
                className="text-xl font-medium text-white mb-2"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                {cs.completedAt}
              </div>
              <div className="text-xs tracking-widest uppercase font-semibold text-white/40">Completed</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:p-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Challenge */}
            <Section>
              <h2
                className="text-2xl font-bold mb-5"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                The Challenge
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {challengeParagraphs.map((p, i) => (
                  <p key={i}>
                    <RichText text={p} />
                  </p>
                ))}
              </div>
            </Section>

            {/* Solution */}
            <Section>
              <h2
                className="text-2xl font-bold mb-5"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                Our Solution
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {solutionParagraphs.map((p, i) => (
                  <p key={i}>
                    <RichText text={p} />
                  </p>
                ))}
              </div>
            </Section>

            {/* Outcomes */}
            <Section>
              <h2
                className="text-2xl font-bold mb-5"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                Verified Outcomes
              </h2>
              <ul className="space-y-3">
                {cs.outcomes.map((outcome, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">{outcome}</span>
                  </motion.li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client */}
            <Section className="bg-white/[0.015] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium tracking-wide text-white">Client</span>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed">{cs.client}</p>
            </Section>

            {/* Engagement */}
            <Section className="bg-white/[0.015] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium tracking-wide text-white">Engagement</span>
              </div>
              <p className="text-muted-foreground font-light">{cs.engagementType}</p>
            </Section>

            {/* Tags */}
            <Section className="bg-white/[0.015] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="text-sm font-medium tracking-wide text-white mb-4">Focus Areas</div>
              <div className="flex flex-wrap gap-2">
                {cs.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/70 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>

            {/* Tech stack */}
            <Section className="bg-white/[0.015] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="text-sm font-medium tracking-wide text-white mb-4">Tech Stack</div>
              <ul className="space-y-2">
                {cs.techStack.map((tech) => (
                  <li key={tech} className="text-sm text-muted-foreground font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {tech}
                  </li>
                ))}
              </ul>
            </Section>

            {/* CTA */}
            <Section className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-muted-foreground mb-6 font-light leading-relaxed">
                  Want results like these for your business?
                </p>
                <Link href="/start-project">
                  <Button className="rounded-full bg-white text-black hover:bg-white/90 px-6 font-medium w-full">
                    Start a Project <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
