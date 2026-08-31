import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { ServiceDetailConfig } from '@/config/service-details';
import { ServiceCategory, ServiceItem, serviceAnchor } from '@/config/services';
import { absUrl, schemaGraph, serviceSchema, webPageSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  ArrowRight, CheckCircle2, Bot, Code, Clapperboard, PenTool, Brain,
  ChevronRight, CircleDot, TerminalSquare, Server, Database, Cloud, LayoutTemplate, Box
} from 'lucide-react';
import { MarketingImage } from '@/components/marketing-image';

const processSteps = [
  { step: "01", title: "Consultation", desc: "Understanding your exact business requirements, challenges, and goals." },
  { step: "02", title: "Requirement Analysis", desc: "Deep dive into feature specifications, architecture, and technology selection." },
  { step: "03", title: "Planning", desc: "Creating detailed timelines, milestones, and structured project roadmaps." },
  { step: "04", title: "Design", desc: "Prototyping intuitive user interfaces and robust system architectures." },
  { step: "05", title: "Development", desc: "Writing scalable, secure code and integrating intelligent AI capabilities." },
  { step: "06", title: "Testing", desc: "Rigorous quality assurance, security audits, and performance checks." },
  { step: "07", title: "Deployment", desc: "Smooth launch with seamless integration into your existing workflows." },
  { step: "08", title: "Support", desc: "Continuous maintenance, proactive monitoring, and long-term improvements." }
];

const whyChooseUs = [
  "AI-First Company",
  "Experienced Team",
  "Business Focused",
  "Scalable Solutions",
  "Secure Development",
  "Modern Technologies",
  "Transparent Communication",
  "Long-Term Support"
];

const techIconMap: Record<string, React.ElementType> = {
  "React": Code, "Next.js": Code, "TypeScript": Code, "Node.js": Server,
  "Python": TerminalSquare, "Java": Server, "PostgreSQL": Database, "MongoDB": Database,
  "Docker": Cloud, "AWS": Cloud, "Supabase": Database, "OpenAI": Bot,
  "Anthropic": Bot, "Google AI": Bot, "Tailwind CSS": LayoutTemplate
};

export function ServiceDetailPage({
  category,
  service,
  details
}: {
  category: ServiceCategory;
  service: ServiceItem;
  details: ServiceDetailConfig;
}) {
  const Icon = category.icon;

  const pagePath = `/services/${category.slug}/${serviceAnchor(service.name)}`;

  useSEO(
    service.name,
    details.overview.what,
    {
      canonicalUrl: absUrl(pagePath),
      ogType: 'website',
      jsonLd: schemaGraph(
        serviceSchema({ name: service.name, description: details.overview.what, path: pagePath }),
        webPageSchema({ path: pagePath, title: service.name, description: details.overview.what }),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: category.title, path: `/services/${category.slug}` },
          { name: service.name, path: pagePath },
        ]),
        ...(details.faqs?.length ? [faqSchema(details.faqs)] : []),
      ),
    }
  );

  const formVal = details.formValue || service.name;
  const startProjectHref = `/start-project?services=${encodeURIComponent(formVal)}`;
  const contactHref = `/contact?service=${encodeURIComponent(formVal)}`;

  const relatedServices = category.services.filter(s => s.name !== service.name);

  return (
    <div className="min-h-screen pt-20 pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/services/${category.slug}`} className="hover:text-primary transition-colors">{category.title}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute inset-0 opacity-30 animate-gradient bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Icon className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
              {service.name}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">
              {details.overview.what}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={startProjectHref} className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-all glow-purple w-full sm:w-auto">
                Start Your Project <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href={contactHref} className="inline-flex items-center justify-center gap-2 glassmorphism px-8 py-4 rounded-lg font-semibold transition-all hover:bg-white/5 border border-white/10 w-full sm:w-auto">
                Book Free Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glassmorphism p-6 sm:p-8 md:p-10 lg:p-14 rounded-2xl max-w-5xl mx-auto border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--app-font-display)' }}>Service Overview</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">What We Deliver</h3>
                    <p className="text-muted-foreground leading-relaxed">{details.overview.what}</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">Who It's For</h3>
                    <p className="text-muted-foreground leading-relaxed">{details.overview.who}</p>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <MarketingImage
                  src="/images/marketing/client-consultation.jpg"
                  alt="Client consultation session"
                  aspectRatio="portrait"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-white/10">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">Why It Matters</h3>
                <p className="text-muted-foreground leading-relaxed">{details.overview.why}</p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">How We Do It</h3>
                <p className="text-muted-foreground leading-relaxed">{details.overview.how}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Problems */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Business Problems We Solve</h2>
            <p className="text-lg text-muted-foreground">Addressing the core operational challenges that hold businesses back.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {details.problems.map((prob, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glassmorphism p-8 rounded-xl border border-white/5 relative"
              >
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-6">
                  <CircleDot className="w-6 h-6 text-destructive/80" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'var(--app-font-display)' }}>{prob.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 max-w-6xl mx-auto">
            {/* Features */}
            <div>
              <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--app-font-display)' }}>Core Features</h2>
              <div className="space-y-6">
                {details.features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feat.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Benefits */}
            <div>
              <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--app-font-display)' }}>Measurable Benefits</h2>
              <div className="space-y-6">
                {details.benefits.map((ben, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glassmorphism p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                  >
                    <h4 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>{ben.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{ben.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--app-font-display)' }}>Industries Served</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {details.industries.map((ind, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-2.5 rounded-full border border-white/10 glassmorphism text-sm font-medium text-foreground hover:bg-white/5 transition-colors cursor-default"
              >
                {ind}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>Our Development Process</h2>
            <p className="text-lg text-muted-foreground">From initial idea to successful deployment and beyond.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glassmorphism p-6 rounded-xl relative border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack & Why Choose Us */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--app-font-display)' }}>Technology Stack</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                {details.techStack.map((tech, i) => {
                  const TechIcon = techIconMap[tech] || Box;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="glassmorphism p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:border-primary/40 transition-colors"
                    >
                      <TechIcon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium">{tech}</span>
                    </motion.div>
                  )
                })}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <MarketingImage
                  src="/images/marketing/cloud-infrastructure.jpg"
                  alt="Enterprise cloud server infrastructure"
                  aspectRatio="video"
                />
              </motion.div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--app-font-display)' }}>Why Choose TurboByte</h2>
              <div className="flex flex-wrap gap-3">
                {whyChooseUs.map((reason, i) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glassmorphism px-5 py-2.5 rounded-full flex items-center gap-2 border border-white/10"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{reason}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>Frequently Asked Questions</h2>
          </div>
          <div className="glassmorphism p-6 md:p-8 rounded-xl border border-white/10">
            <Accordion type="single" collapsible className="w-full">
              {details.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                  <AccordionTrigger className="text-lg hover:text-primary text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-12 md:py-24 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedServices.slice(0, 2).map((relService, i) => (
                <Link key={i} href={`/services/${category.slug}/${serviceAnchor(relService.name)}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glassmorphism p-8 rounded-xl border border-white/10 hover:border-primary/50 transition-all group cursor-pointer h-full"
                  >
                    <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--app-font-display)' }}>{relService.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{relService.desc}</p>
                    <div className="mt-6 flex items-center text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glassmorphism p-8 md:p-12 rounded-2xl border border-white/10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Let's build an intelligent solution tailored specifically for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={startProjectHref} className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-all glow-purple w-full sm:w-auto">
                Start Your Project <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href={contactHref} className="inline-flex items-center justify-center gap-2 glassmorphism px-8 py-4 rounded-lg font-semibold transition-all hover:bg-white/5 border border-white/10 w-full sm:w-auto">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
