import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, MotionConfig, useInView, useScroll, useTransform } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { VantaClouds } from '@/components/vanta-net';
import { NewsletterSection } from '@/components/newsletter-section';
import { OrbitingSkills, type OrbitSkillItem } from '@/components/unlumen-ui/orbiting-skills';
import { useReducedMotion } from 'framer-motion';
import { AmbientGlow } from '@/components/ambient-glow';

const OUR_SERVICES: OrbitSkillItem[] = [
  { label: 'Website Design' },
  { label: 'Custom Software' },
  { label: 'AI Automation' },
  { label: 'E-commerce Stores' },
  { label: 'Mobile Apps' },
  { label: 'SEO & Growth' },
];
import { TextScramble } from '@/components/core/text-scramble';
import { TextRoll } from '@/components/core/text-roll';
import { HomepageCampaignBanner } from '@/components/campaign/homepage-banner';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShowcaseCarousel } from '@/components/showcase-carousel';
import { MarketingImage } from '@/components/marketing-image';
import {
  ArrowRight,
  Brain,
  Building2,
  Cpu,
  Headphones,
  Globe,
  MessageSquareText,
  PhoneCall,
  Target,
  Workflow,
  BookOpenText,
  ChevronRight
} from 'lucide-react';
import { companyStats } from '@/config/site';

/* ------------------------------ content data ------------------------------ */

const featuredServices = [
  { name: 'AI Customer-Support Chatbots', icon: MessageSquareText, href: '/services/ai-agents', desc: 'Chatbots that resolve customer queries instantly and work around the clock.' },
  { name: 'AI Voice & Virtual Receptionists', icon: PhoneCall, href: '/services/ai-agents', desc: 'Natural-sounding voice agents that answer calls, route enquiries, and book appointments.' },
  { name: 'Lead-Generation & Sales AI', icon: Target, href: '/services/ai-agents', desc: 'Assistants that engage visitors, qualify leads, and hand warm prospects to your team.' },
  { name: 'Knowledge-Base Assistants', icon: BookOpenText, href: '/services/ai-agents', desc: 'Internal AI that answers instantly from your documents, policies, and processes.' },
  { name: 'Business Workflow Automation', icon: Workflow, href: '/services/automation', desc: 'End-to-end automation of approvals, data entry, notifications, and reporting.' },
  { name: 'Premium Website Development', icon: Globe, href: '/services/development', desc: 'Modern, high-performance websites enhanced with intelligent chat and personalization.' },
];

const whyChoose = [
  { icon: Brain, title: 'AI-Native Architecture', desc: 'Intelligence isn\'t bolted on; it\'s woven into the foundation of every product we build.' },
  { icon: Building2, title: 'Enterprise Precision', desc: 'We deliver the reliability, security, and polish expected by top-tier organizations.' },
  { icon: Cpu, title: 'Modern Stack', desc: 'Built on today\'s most robust frameworks — ensuring speed, scale, and longevity.' },
  { icon: Headphones, title: 'Bengaluru Based', desc: 'Direct access to your core engineering team with dedicated post-launch support.' },
];

const faqs = [
  {
    question: 'How fast can you launch a new website or AI solution?',
    answer: 'For standard business websites and foundational AI chatbot integrations, we can go live in just 2 to 3 days. Complex custom portals, ERPs, or advanced workflow automations typically take 2-6 weeks depending on scope.'
  },
  {
    question: 'What happens after my project goes live?',
    answer: 'We provide 30 days of complimentary post-launch support to ensure everything runs perfectly. After that, we offer affordable maintenance retainers to keep your systems updated and secure.'
  },
  {
    question: 'Are you based in Bengaluru? Can we meet?',
    answer: 'Yes, our engineering and design team operates out of Kudlu Gate, Bengaluru. We are always happy to schedule a virtual discovery call or an in-person meeting for local enterprise partners.'
  },
  {
    question: 'Do you charge monthly fees or a one-time cost?',
    answer: 'We offer transparent, fixed-cost pricing for the build and deployment. For ongoing services like AI agent hosting, cloud infrastructure, or maintenance, we offer flexible, predictable monthly retainers.'
  },
  {
    question: 'Will I own the code and domain?',
    answer: 'Absolutely. Once the project is fully paid, you own the complete intellectual property. We even provide the first year of your domain registration for free as part of our launch packages.'
  },
  {
    question: 'How do I start a project with TurboByte?',
    answer: 'Simply reach out via our contact form or start a project page to schedule a free discovery call. We will discuss your goals, outline a clear strategy, and provide a transparent quote within 24 hours.'
  }
];

/* ------------------------------- components ------------------------------- */

function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Home() {
  useSEO(
    'TurboByte Tech Solutions | Website Design & Development Company in Bengaluru, India',
    'Want a website for your business? TurboByte is a website creation and software development company in Bengaluru building professional websites, e-commerce stores, web & mobile apps, and AI automation — live in 2–3 days with a free first-year domain.',
    {
      absoluteTitle: true,
      jsonLd: schemaGraph(
        webPageSchema({
          path: '/',
          title: 'TurboByte Tech Solutions | Website Design & Development Company in Bengaluru, India',
          description: 'Want a website for your business? TurboByte is a website creation and software development company in Bengaluru building professional websites, e-commerce stores, web & mobile apps, and AI automation — live in 2–3 days with a free first-year domain.'
        }),
        breadcrumbSchema([{ name: 'Home', path: '/' }]),
        faqSchema(faqs)
      )
    },
  );

  const activeStats = companyStats.filter((s) => s.value !== null);
  const prefersReducedMotion = useReducedMotion();
  const [orbitOpen, setOrbitOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Vanta NET animated background with gradient mask */}
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <VantaClouds />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <AmbientGlow color="mixed" position="center" className="opacity-40" />
        </motion.div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-8 md:pb-12 max-w-7xl">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-6 tracking-widest uppercase">
                <TextScramble>BENGALURU AI TECH STUDIO</TextScramble>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium mb-6 leading-[1.05] tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                <span className="text-white">Precision Software.</span>
                <br />
                <span className="premium-gradient-text">
                  <TextRoll duration={0.8} getEnterDelay={(i) => i * 0.05 + 0.3}>Powered by AI.</TextRoll>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-foreground/85 mb-8 max-w-3xl mx-auto leading-relaxed font-normal md:font-light">
                We design, build, and ship enterprise-grade websites, custom applications, and intelligent automation for ambitious businesses ready to scale.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="premium" className="h-14 px-8 text-base">
                  <Link href="/start-project" data-testid="button-hero-book-consultation">
                    Start Your Project
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base glass-panel-premium text-white hover:text-white">
                  <Link href="/portfolio" data-testid="button-hero-view-work">
                    View Our Work
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-14 px-8 text-base text-primary hover:bg-primary/10 rounded-full transition-colors border border-primary/30 premium-border-gradient">
                  <Link href="/demo" data-testid="button-hero-live-demo">
                    Try Live Demo
                  </Link>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-12 md:gap-y-6 text-sm text-white/50" data-testid="list-hero-trust-points">
                {[
                  { text: 'Live in 2–3 Days' },
                  { text: 'Free Domain (1st Year)' },
                  { text: '30-Day Post-Launch Support' },
                  { text: 'Local Bengaluru Team' }
                ].map((point, i) => (
                  <motion.div
                    key={point.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                    className="flex items-center tracking-wide"
                  >
                    <span>{point.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* Showcase Carousel */}
      <section className="pt-16 md:pt-32 pb-8 md:pb-12 relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium mb-6 tracking-tight text-white leading-[1.1]" style={{ fontFamily: 'var(--app-font-display)' }}>
              Start with a vision. <span className="text-white/40">Go live in days.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Websites and business software built by our studio — from clinic and salon websites to e-commerce stores and custom HR systems.
            </p>
          </motion.div>
        </div>

        <ShowcaseCarousel />
      </section>

      {/* About Section */}
      <section className="py-10 md:py-16 relative">
        <AmbientGlow color="lilac" position="top-left" className="opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto"
          >
            <div className="lg:col-span-8 glass-panel p-6 sm:p-8 md:p-16 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-8 uppercase tracking-widest">
                <TextScramble trigger={orbitOpen || true}>ABOUT TURBOBYTE</TextScramble>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8 text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                We engineer intelligent software that drives real growth.
              </h3>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl font-light">
                Founded in 2026 and based in Bengaluru, India, TurboByte is an AI-first development studio. We partner with ambitious startups and established enterprises to build custom software, premium websites, and intelligent automation workflows.
              </p>

              {prefersReducedMotion ? (
                <div className="mt-8 md:mt-12 flex flex-wrap justify-center md:justify-start gap-3" data-testid="orbit-tech-stack">
                  {OUR_SERVICES.map((t) => (
                    <span key={t.label} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-white/80">
                      {t.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className={`mt-8 flex flex-col items-center transition-[padding] duration-500 ease-out motion-reduce:transition-none ${orbitOpen ? 'py-36 md:py-32' : 'py-2 md:py-6'}`} data-testid="orbit-tech-stack">
                  {orbitOpen ? (
                    <OrbitingSkills items={OUR_SERVICES} radius={150} followCursor={false}>
                      <button
                        type="button"
                        onClick={() => setOrbitOpen(false)}
                        aria-expanded={true}
                        aria-label="Hide our services orbit"
                        className="flex size-20 md:size-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                        data-testid="button-orbit-toggle"
                      >
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="TurboByte logo" className="size-12 md:size-14 object-contain" />
                      </button>
                    </OrbitingSkills>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOrbitOpen(true)}
                      aria-expanded={false}
                      aria-label="Show what we build"
                      className="group flex flex-row md:flex-col items-center md:items-center gap-4 border border-white/5 md:border-transparent rounded-full p-2 md:p-0 pr-6 md:pr-0 w-full md:w-auto hover:bg-white/5 md:hover:bg-transparent transition-colors"
                      data-testid="button-orbit-toggle"
                    >
                      <span className="flex size-16 md:size-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10 transition-transform group-hover:scale-105 shrink-0">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="TurboByte logo" className="size-8 md:size-14 object-contain" />
                      </span>
                      <span className="text-xs uppercase tracking-widest text-primary/80 font-medium">Click to see what we build</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 glass-panel p-6 sm:p-8 md:p-12 rounded-3xl flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#DCBBE5]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 mb-8 md:mb-10">
                <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-2 md:mb-3 uppercase tracking-widest">
                  <TextScramble>OUR COMMITMENT</TextScramble>
                </div>
                <h4 className="text-2xl md:text-3xl font-medium text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--app-font-display)' }}>
                  The Standard
                </h4>
              </div>

              <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                {[
                  {
                    title: 'Honest Communication',
                    desc: 'No jargon, no hidden fees. We set clear expectations and keep you updated at every milestone.'
                  },
                  {
                    title: 'Custom Architecture',
                    desc: 'We don\'t force templates. Every solution is architected from the ground up for your specific scale.'
                  },
                  {
                    title: 'Enterprise Security',
                    desc: 'Bank-grade encryption, secure APIs, and robust data protection protocols come standard.'
                  },
                  {
                    title: 'Measurable Outcomes',
                    desc: 'We define success metrics before we write a single line of code, ensuring real business impact.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-5 group/item">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary/50 group-hover/item:bg-primary shrink-0 shadow-[0_0_10px_rgba(124,58,237,0)] group-hover/item:shadow-[0_0_10px_rgba(124,58,237,0.8)] transition-all duration-300" />
                      {i !== 3 && <div className="w-[1px] h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent mt-2 mb-1" />}
                    </div>
                    <div className="pb-0 md:pb-1">
                      <h5 className="text-white font-medium text-base md:text-lg mb-1 tracking-tight group-hover/item:text-primary transition-colors duration-300">{item.title}</h5>
                      <p className="text-muted-foreground text-xs md:text-sm font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 md:py-32 relative bg-background">
        <AmbientGlow color="mixed" position="center" className="opacity-20 top-[30%]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:p-12 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--app-font-display)' }}>
                Services engineered for <span className="text-white/40">the modern web.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                AI isn't just a feature; it's our foundation. We integrate intelligent agents and seamless automation into stunning digital products.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link href="/services">
                <Button variant="ghost" className="rounded-full hover:bg-white/5 border border-white/5 px-8 h-14 text-base font-medium">
                  Explore Services <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {featuredServices.map((service, i) => {
              const isFull = i === 5;
              return (
                <motion.div
                  key={service.name}
                  className={
                    i === 0 ? "md:col-span-7" :
                    i === 1 ? "md:col-span-5" :
                    i === 2 ? "md:col-span-4" :
                    i === 3 ? "md:col-span-4" :
                    i === 4 ? "md:col-span-4" :
                    "md:col-span-12"
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                >
                  <Link href={service.href} className="block h-full rounded-2xl md:rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover-lift">
                    <div className="group relative flex flex-row md:flex-col justify-between items-center md:items-stretch p-4 md:p-10 rounded-[1.5rem] md:rounded-[2rem] glass-panel hover:border-white/20 transition-all duration-500 overflow-hidden h-full cursor-pointer gap-4 md:gap-0" data-testid={`card-home-service-${i}`}>

                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-[#DCBBE5]/10 transition-colors duration-700 hidden md:block" />

                      <div className={`relative z-10 flex ${isFull ? 'flex-col md:flex-row md:items-center gap-2 md:gap-16' : 'flex-col'} w-full h-full`}>
                        <div className={`flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 ${isFull ? 'md:w-1/2' : 'flex-1'}`}>
                          <div className="flex justify-between items-start md:mb-12 shrink-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-lg">
                              <service.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                            </div>
                            <div className="text-white/10 font-mono text-lg md:text-xl font-light select-none hidden md:block">0{i + 1}</div>
                          </div>

                          <div className="flex-1 mt-auto">
                            <h3 className="text-base md:text-3xl font-medium text-white mb-1 md:mb-4 tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-1 md:line-clamp-none" style={{ fontFamily: 'var(--app-font-display)' }}>
                              {service.name}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed font-light text-xs md:text-lg line-clamp-1 md:line-clamp-none">
                              {service.desc}
                            </p>
                          </div>
                        </div>

                        {isFull && (
                          <div className="hidden md:flex md:w-1/2 justify-end items-center opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center relative bg-primary/[0.02]">
                              <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite] motion-reduce:animate-none" />
                              <div className="absolute inset-4 rounded-full border border-primary/10 animate-[spin_15s_linear_infinite_reverse] motion-reduce:animate-none" />
                              <service.icon className="w-16 h-16 text-primary/60" strokeWidth={1} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 md:mt-8 h-6 flex items-center shrink-0">
                        <span className="hidden md:flex absolute inset-y-0 left-0 items-center text-white/40 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1 motion-reduce:transition-none text-sm font-medium">
                          Learn more
                        </span>
                        <span className="hidden md:flex absolute inset-y-0 left-0 items-center text-primary opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 motion-reduce:transition-none text-sm font-medium">
                          Explore service <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                        <ChevronRight className="w-5 h-5 text-white/40 md:hidden block group-hover:text-primary transition-colors" />
                      </div>

                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-10 md:py-32 border-y border-white/5 relative overflow-hidden bg-white/[0.01]">
        <AmbientGlow color="lilac" position="bottom-right" className="opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 md:mb-16"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Why Partner With TurboByte
                </h2>
                <p className="text-xl text-muted-foreground font-light">
                  We blend engineering excellence with deep business acumen.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                {whyChoose.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex flex-row items-start gap-4"
                  >
                    <div className="shrink-0 mt-1">
                      <item.icon className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium mb-2 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <MarketingImage
                src="/images/marketing/turbobyte-office.jpg"
                alt="Branded technology office and collaboration space"
                aspectRatio="portrait"
                className="shadow-2xl"
                imageClassName="object-[center_45%]"
              />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Try the AI Demo */}
      <section className="py-20 md:py-40 relative overflow-hidden bg-background">
        <AmbientGlow color="primary" position="center" className="opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-4 md:mb-8 uppercase tracking-widest">
              Interactive Experience
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-medium mb-4 md:mb-8 tracking-tight text-white leading-[1.1]" style={{ fontFamily: 'var(--app-font-display)' }}>
              Watch Your Idea Come To <span className="text-white/40">Life Instantly.</span>
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 font-light leading-relaxed max-w-3xl mx-auto">
              Describe your business in a single sentence and our AI will generate a live, interactive prototype right in your browser. No sign-up required.
            </p>
            <Link href="/demo">
              <Button size="lg" variant="premium" className="h-14 px-10 text-lg rounded-full" data-testid="button-home-try-demo">
                Launch The AI Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <HomepageCampaignBanner />

      {/* Company Stats */}
      {activeStats.length > 0 && (
        <section className="py-12 md:py-24 border-t border-white/5 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:p-12 text-center max-w-6xl mx-auto">
              {activeStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-medium text-white mb-2 md:mb-4 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                    <AnimatedCounter value={stat.value as number} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs md:text-sm font-medium tracking-widest text-muted-foreground uppercase">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      <section className="py-10 md:py-32 bg-background border-t border-white/5 relative overflow-hidden">
        <AmbientGlow color="mixed" position="bottom-left" className="opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 md:gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8 text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                Clarity before <span className="text-white/40">commitment.</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 font-light leading-relaxed">
                We believe in total transparency. Here are the most common questions we get from business owners evaluating a technology partner.
              </p>
              <Link href="/contact">
                <Button variant="ghost" className="rounded-full border border-white/5 px-8 h-12 font-medium hover:bg-white/5 text-base">
                  Ask us anything else
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="glass-panel rounded-2xl px-6 md:px-8 data-[state=open]:border-white/20 transition-all duration-300 hover:bg-white/[0.07]"
                    data-testid={`faq-item-${i}`}
                  >
                    <AccordionTrigger className="text-left font-medium text-base md:text-lg text-white hover:no-underline py-4 md:py-6" style={{ fontFamily: 'var(--app-font-display)' }} data-testid={`faq-trigger-${i}`}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-4 md:pb-8 font-light" data-testid={`faq-content-${i}`}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Big Final CTA */}
      <section className="py-20 md:py-40 relative bg-background border-t border-white/5 text-center overflow-hidden">
        <AmbientGlow color="lilac" position="top-right" className="opacity-20" />
        <AmbientGlow color="primary" position="bottom-left" className="opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-medium mb-8 text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--app-font-display)' }}>
              Ready to build something <span className="premium-gradient-text">extraordinary?</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-light leading-relaxed max-w-3xl mx-auto">
              Join the growing list of businesses scaling with TurboByte's custom software, premium web development, and AI automation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/start-project">
                <Button size="lg" variant="premium" className="h-14 px-10 rounded-full text-base font-medium" data-testid="button-cta-start-project">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-base text-white hover:text-white font-medium glass-panel-premium" data-testid="button-cta-contact-us">
                  Schedule A Call
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <NewsletterSection />

    </div>
    </MotionConfig>
  );
}