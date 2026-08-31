import { motion, MotionConfig } from 'framer-motion';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import {
  Target,
  Eye,
  Lightbulb,
  ShieldCheck,
  Trophy,
  Gem,
  Anchor,
  ScanEye,
  GraduationCap,
  Handshake,
  Brain,
  BadgeCheck,
  Cpu,
  Briefcase,
  Layers,
  Lock,
  MessagesSquare,
  Headphones,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { TextScramble } from '@/components/core/text-scramble';
import { TextRoll } from '@/components/core/text-roll';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';
import { siteConfig } from '@/config/site';

const values = [
  { icon: Lightbulb, title: 'Innovation', desc: 'We explore emerging technologies and creative approaches to keep your business ahead.' },
  { icon: ShieldCheck, title: 'Integrity', desc: 'We do what we say, communicate honestly, and stand behind every commitment.' },
  { icon: Trophy, title: 'Customer Success', desc: 'Your outcomes define our success. We build solutions that move your business forward.' },
  { icon: Gem, title: 'Quality', desc: 'Every deliverable is held to enterprise standards of craftsmanship and polish.' },
  { icon: Anchor, title: 'Reliability', desc: 'Dependable systems, dependable people. We deliver on time and keep things running.' },
  { icon: ScanEye, title: 'Transparency', desc: 'Clear pricing, clear timelines, and full visibility into progress at every stage.' },
  { icon: GraduationCap, title: 'Continuous Learning', desc: 'We evolve with the technology landscape so our clients always benefit from the best.' },
  { icon: Handshake, title: 'Long-Term Partnerships', desc: 'We aim to be your technology partner for years, not just for a single project.' },
];

const whyChoose = [
  { icon: Brain, title: 'AI-First Development', desc: 'Artificial intelligence is built into how we design, develop, and deliver — not bolted on afterwards.' },
  { icon: BadgeCheck, title: 'Enterprise Quality', desc: 'Rigorous engineering standards, code quality, and testing on every project, regardless of size.' },
  { icon: Cpu, title: 'Modern Technologies', desc: 'We build with a modern, proven stack so your product stays fast, maintainable, and future-ready.' },
  { icon: Briefcase, title: 'Business-Focused Solutions', desc: 'Technology decisions grounded in your business goals, not trends. Every feature earns its place.' },
  { icon: Layers, title: 'Scalable Architecture', desc: 'Systems designed to grow with you — from first launch to enterprise scale without rewrites.' },
  { icon: Lock, title: 'Secure Development', desc: 'Security best practices applied from day one: safe data handling, hardened deployments, careful access control.' },
  { icon: MessagesSquare, title: 'Transparent Communication', desc: 'Regular updates, honest estimates, and a single point of contact throughout your project.' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'We stay with you after launch with responsive support and continuous improvement.' },
];

const approach = [
  { step: '1', title: 'Understand Your Business', desc: 'We start by learning your goals, workflows, and challenges — so the solution fits your business, not the other way around.' },
  { step: '2', title: 'Plan the Right Solution', desc: 'We define scope, architecture, and milestones with clear timelines and transparent estimates.' },
  { step: '3', title: 'Design Modern Experiences', desc: 'Premium, intuitive interfaces designed around your users and your brand.' },
  { step: '4', title: 'Develop High-Quality Software', desc: 'Clean, maintainable code built with modern technologies and enterprise engineering standards.' },
  { step: '5', title: 'Test Thoroughly', desc: 'Functional, performance, and security testing before anything reaches your users.' },
  { step: '6', title: 'Deploy Securely', desc: 'Hardened, reliable deployments with monitoring in place from day one.' },
  { step: '7', title: 'Provide Continuous Support', desc: 'Ongoing maintenance, improvements, and a partner who answers when you call.' },
];

const technologies = [
  'Artificial Intelligence', 'Machine Learning', 'React', 'Next.js', 'Node.js', 'Python',
  'Java', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS',
  'OpenAI', 'Anthropic', 'Google AI', 'Supabase', 'Tailwind CSS', 'Cloud Technologies',
];

const industries = [
  'Healthcare', 'Education', 'Retail', 'Real Estate', 'Finance', 'Manufacturing',
  'Logistics', 'Hospitality', 'Professional Services', 'Startups', 'SMEs', 'Enterprise Businesses',
];

const whoWeHelp = [
  { title: 'Startups', desc: 'Launch MVPs quickly with scalable foundations that are ready for rapid growth.' },
  { title: 'Small Businesses', desc: 'Automate manual tasks and build digital presence to compete with larger players.' },
  { title: 'Medium Businesses', desc: 'Modernize legacy systems and streamline operations across growing teams.' },
  { title: 'Enterprises', desc: 'Implement secure, enterprise-grade AI and custom software solutions.' },
  { title: 'Educational Institutions', desc: 'Enhance learning management and automate administrative school workflows.' },
  { title: 'Healthcare', desc: 'Build secure patient management systems and intelligent booking platforms.' },
  { title: 'Finance', desc: 'Develop secure, compliant dashboards and automated data processing tools.' },
  { title: 'Retail', desc: 'Create seamless e-commerce experiences and robust inventory management.' },
  { title: 'Manufacturing', desc: 'Streamline production tracking and custom ERP systems for factory floors.' },
  { title: 'Logistics', desc: 'Optimize delivery routing, fleet tracking, and supply chain automation.' },
  { title: 'Real Estate', desc: 'Build property management portals and intelligent booking or CRM systems.' },
  { title: 'Hospitality', desc: 'Deliver custom ordering apps and streamlined guest management platforms.' }
];

export default function About() {
  useSEO(
    'About Us | TurboByte Tech Solutions Private Limited',
    'TurboByte Tech Solutions is a website design and software development company in Bengaluru, India — building professional websites, apps, and AI automation for growing businesses.',
    {
      jsonLd: schemaGraph(
        webPageSchema({
          path: '/about',
          title: 'About Us | TurboByte Tech Solutions Private Limited',
          description: 'Learn about TurboByte Tech Solutions, an AI-first technology company delivering intelligent software, automation, and business transformation solutions.'
        }),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' }
        ])
      )
    }
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen pt-20 bg-background text-foreground overflow-hidden">
        {/* Hero */}
        <section className="py-12 md:py-24 relative overflow-hidden">
          <AmbientHero />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-6 tracking-widest uppercase">
                <TextScramble>COMPANY PROFILE</TextScramble>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium mb-6 leading-[1.05] tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                <TextRoll>About TurboByte</TextRoll>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
                Founded in {siteConfig.foundedYear} and headquartered in Bengaluru, India, {siteConfig.legalName} is an AI-first technology company helping businesses innovate, automate, and grow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Who We Are - Bento Box */}
        <section className="py-12 md:py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto"
            >
              <div className="lg:col-span-8 bg-card border border-white/5 p-6 sm:p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
                <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-8 uppercase tracking-widest">
                  Who We Are
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8 text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Building intelligent software that drives real growth.
                </h2>
                <MarketingImage
                  src="/images/marketing/team-culture.jpg"
                  alt="Team collaborative session"
                  aspectRatio="wide"
                  className="mb-8"
                />
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light mb-12">
                  <p>
                    {siteConfig.legalName} is an AI-first technology company dedicated to helping businesses innovate, automate, and grow through intelligent digital solutions.
                  </p>
                  <p>{siteConfig.descriptionExtended}</p>
                  <p>{siteConfig.descriptionFocus}</p>
                </div>

                <div className="border-t border-white/10 pt-8 mt-auto">
                  <h3 className="text-xl font-medium text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Our Journey</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    TurboByte Tech Solutions is a newly established technology company focused on delivering modern AI-powered software solutions. While we are at the beginning of our journey, our mission is to build reliable, scalable, and high-quality digital products for businesses of all sizes.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 bg-card border border-white/5 p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-lg mb-6">
                      <Target className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Our Mission</h3>
                    <p className="text-muted-foreground font-light leading-relaxed flex-1">
                      {siteConfig.mission}
                    </p>
                  </div>
                </div>
                <div className="flex-1 bg-white/[0.015] border border-white/5 p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-lg mb-6">
                      <Eye className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Our Vision</h3>
                    <p className="text-muted-foreground font-light leading-relaxed flex-1">
                      {siteConfig.vision}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-12 md:py-24 bg-background border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                The principles that guide every project we deliver and every partnership we build.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.1 }}
                  className="group relative flex flex-col p-6 sm:p-8 md:p-10 rounded-[2rem] bg-white/[0.015] border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)] overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-lg mb-8 relative z-10">
                    <value.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-medium text-white mb-3 tracking-tight group-hover:text-primary transition-colors duration-300 relative z-10" style={{ fontFamily: 'var(--app-font-display)' }}>{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-light relative z-10">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose TurboByte */}
        <section className="py-12 md:py-24 bg-card/50 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                Why Partner With Us
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                What sets us apart as your technology partner
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-12 lg:gap-24">
              <div className="flex flex-col gap-6 md:p-10">
                {whyChoose.slice(0, 4).map((item, i) => (
                  <div key={item.title} className="flex gap-5 group/item">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary/50 group-hover/item:bg-primary shrink-0 shadow-[0_0_10px_rgba(124,58,237,0)] group-hover/item:shadow-[0_0_10px_rgba(124,58,237,0.8)] transition-all duration-300" />
                      {i !== 3 && <div className="w-[1px] h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent mt-3 mb-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
                        <h3 className="text-white font-medium text-xl tracking-tight group-hover/item:text-primary transition-colors duration-300">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-6 md:p-10">
                {whyChoose.slice(4, 8).map((item, i) => (
                  <div key={item.title} className="flex gap-5 group/item">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary/50 group-hover/item:bg-primary shrink-0 shadow-[0_0_10px_rgba(124,58,237,0)] group-hover/item:shadow-[0_0_10px_rgba(124,58,237,0.8)] transition-all duration-300" />
                      {i !== 3 && <div className="w-[1px] h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent mt-3 mb-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
                        <h3 className="text-white font-medium text-xl tracking-tight group-hover/item:text-primary transition-colors duration-300">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-12 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                Our Approach
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                A proven process from first conversation to long-term partnership.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />
              <div className="space-y-6 lg:space-y-0">
                {approach.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.1 }}
                    className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-6 md:p-12 ${
                      i % 2 === 0 ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`hidden lg:flex flex-1 justify-${i % 2 === 0 ? 'start' : 'end'}`}>
                      <div className="w-1/2" />
                    </div>

                    <div className="relative z-10 flex items-center justify-center shrink-0">
                      <div className="w-16 h-16 rounded-full bg-card border border-primary/20 flex items-center justify-center text-primary font-mono text-xl shadow-[0_0_20px_rgba(124,58,237,0.1)] relative">
                        <div className="absolute inset-[-4px] rounded-full border border-primary/30 border-dashed animate-[spin_10s_linear_infinite] motion-reduce:animate-none" />
                        0{step.step}
                      </div>
                    </div>

                    <div className="flex-1 w-full lg:w-auto">
                      <div className="bg-white/[0.015] border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors duration-500 hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.1)] group">
                        <h3 className="text-xl font-medium tracking-tight mb-4 text-white" style={{ fontFamily: 'var(--app-font-display)' }}>{step.title}</h3>
                        <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technology & Industries */}
        <section className="py-12 md:py-24 bg-card/50 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto">

              {/* Technology Expertise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-medium mb-8 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Technology Stack</h2>
                <MarketingImage
                  src="/images/marketing/ai-engineering-workspace.jpg"
                  alt="AI engineering workstation with code and neural network diagrams"
                  aspectRatio="video"
                  className="mb-8"
                  imageClassName="object-[center_42%]"
                />
                <div className="flex flex-wrap gap-3">
                  {technologies.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02 }}
                      className="bg-white/[0.02] border border-white/10 hover:border-primary/40 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide text-white/80 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Industries We Serve */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-medium mb-8 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Industries We Serve</h2>
                <div className="flex flex-wrap gap-3">
                  {industries.map((industry, i) => (
                    <motion.span
                      key={industry}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02 }}
                      className="bg-white/[0.02] border border-white/10 hover:border-primary/40 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide text-white/80 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                    >
                      {industry}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Who We Help */}
        <section className="py-12 md:py-24 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                Who We Help
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Tailored technology solutions for diverse businesses and sectors.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {whoWeHelp.map((audience, i) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.05 }}
                  className="group p-6 rounded-2xl bg-white/[0.015] border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.1)] h-full"
                  data-testid={`card-who-we-help-${i}`}
                >
                  <h3 className="text-lg font-medium text-white mb-2 tracking-tight group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--app-font-display)' }}>{audience.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{audience.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Headquarters */}
        <section className="py-12 md:py-24 bg-card/50 border-y border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-white/5 p-6 sm:p-8 md:p-16 rounded-[3rem] relative overflow-hidden group max-w-3xl mx-auto text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <MapPin className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-4xl font-medium text-white mb-2 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>Bengaluru, India</h3>
              <p className="text-primary text-sm font-medium uppercase tracking-widest mb-8">Headquarters</p>

              <a
                href={siteConfig.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground font-light hover:text-primary transition-colors leading-relaxed block mb-10 text-lg"
                data-testid="link-about-address"
              >
                {siteConfig.address.lines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < siteConfig.address.lines.length - 1 && <br />}
                  </span>
                ))}
              </a>

              <div className="flex flex-col items-center gap-5 text-muted-foreground font-light">
                <a href={siteConfig.emailHref} className="flex items-center gap-3 hover:text-primary transition-colors break-all" data-testid="link-about-email">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{siteConfig.email}</span>
                </a>
                <a href={siteConfig.phoneHref} className="flex items-center gap-3 hover:text-primary transition-colors" data-testid="link-about-phone">
                  <Phone className="w-5 h-5 text-primary" />
                  {siteConfig.phone}
                </a>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  {siteConfig.businessHours.days}, {siteConfig.businessHours.hours}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-white/5 p-6 sm:p-8 md:p-16 rounded-[3rem] relative overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium mb-6 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Let's Build the <span className="text-white/40">Future Together</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto font-light">
                  Whether you're launching a startup, growing your business or exploring AI, our team is ready to help transform your ideas into reality.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/start-project"
                    className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-white text-black font-medium transition-transform hover:scale-105"
                  >
                    Start Your Project
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-white/[0.05] border border-white/10 text-white font-medium hover:bg-white/[0.1] transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
