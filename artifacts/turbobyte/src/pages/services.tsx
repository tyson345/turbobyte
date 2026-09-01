import { useMemo } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { basePath } from '@/lib/paths';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import {
  ArrowRight, Search, X, SearchX, CheckCircle2,
  Settings, Zap, Shield, FileText, Bot,
  MessageSquare, LayoutGrid,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { serviceCategories, serviceAnchor } from '@/config/services';
import { TextScramble } from '@/components/core/text-scramble';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';
import { AmbientGlow } from '@/components/ambient-glow';

const faqData = [
  {
    question: "Which industries do you work with?",
    answer: "We work across a diverse range of industries including healthcare, retail, finance, education, real estate, logistics and more. Our AI and software solutions are adaptable to the specific operational needs of almost any sector."
  },
  {
    question: "Can AI integrate with our existing software?",
    answer: "Yes, our AI solutions are designed to integrate seamlessly with your existing software via APIs and custom integrations. We ensure the transition enhances your current workflows without disrupting them."
  },
  {
    question: "How long does development take?",
    answer: "Timelines depend entirely on the scope and complexity of the project. A custom AI chatbot might take a few weeks, while an enterprise software platform could take several months. We provide clear, transparent timelines after our initial discovery phase."
  },
  {
    question: "Do you provide support after launch?",
    answer: "Absolutely. We offer long-term support and maintenance after launch to ensure your systems remain secure, up-to-date, and continue to perform optimally as your business grows."
  },
  {
    question: "Can services be customized?",
    answer: "Yes, every service is fully customizable. We build solutions tailored exactly to your business goals, operational challenges, and brand identity."
  }
];

const processSteps = [
  { title: "Discovery", icon: Search, desc: "Understanding your business goals and identifying AI opportunities." },
  { title: "Planning", icon: FileText, desc: "Defining architecture, scope, and measurable outcomes." },
  { title: "Design", icon: LayoutGrid, desc: "Creating intuitive, premium interfaces and brand assets." },
  { title: "Development", icon: Bot, desc: "Building secure, scalable software and training AI models." },
  { title: "Testing", icon: Shield, desc: "Rigorous quality assurance, security, and performance testing." },
  { title: "Deployment", icon: Zap, desc: "Smooth launch with seamless integration into your workflows." },
  { title: "Support", icon: Settings, desc: "Long-term maintenance, monitoring, and continuous improvement." }
];

const whyChooseUs = [
  "AI-First Development",
  "Enterprise Security",
  "Modern Technologies",
  "Business-Centric Solutions",
  "Future Ready",
  "Transparent Communication",
  "Long-Term Support"
];

const comparisonData = [
  { feature: "Speed", manual: "Slow & prone to bottlenecks", traditional: "Restricted by human input speed", ai: "Instant, real-time processing" },
  { feature: "Automation", manual: "None", traditional: "Rules-based, rigid automation", ai: "Intelligent, adaptive automation" },
  { feature: "Scalability", manual: "Requires hiring more staff", traditional: "Requires server/license upgrades", ai: "Scales effortlessly on demand" },
  { feature: "Cost Efficiency", manual: "High ongoing labor costs", traditional: "Moderate, often hidden fees", ai: "High ROI, low marginal cost" },
  { feature: "Customer Experience", manual: "Inconsistent, limited hours", traditional: "Self-serve but frustrating", ai: "24/7, personalized & conversational" },
  { feature: "Decision Making", manual: "Gut feeling, delayed reporting", traditional: "Static reports, backward-looking", ai: "Predictive, data-driven insights" }
];

const filterOptions = [
  { label: 'AI', value: 'ai-agents' },
  { label: 'Development', value: 'development' },
  { label: 'Automation', value: 'automation' },
  { label: 'Branding', value: 'branding-design' },
  { label: 'Creative', value: 'ai-creative' },
  { label: 'Consulting', value: 'ai-consulting' }
];

export default function Services() {
  const seoTitle = 'Website Creation & Software Services | TurboByte Tech Solutions, Bengaluru';
  const seoDescription =
    'Professional website creation, e-commerce development, business automation, AI chatbots, custom apps, and branding services from TurboByte — a website design and development company in Bengaluru, India.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/services', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
      ]),
    ),
  });

  const [location, navigate] = useLocation();
  const search = useSearch();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const query = params.get('q') ?? '';
  const activeCategory = params.get('category');

  const updateParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    const qs = next.toString();
    navigate(qs ? `${location}?${qs}` : location, { replace: true });
  };

  const setQuery = (value: string) => updateParams((p) => (value ? p.set('q', value) : p.delete('q')));
  const toggleCategory = (category: string) => updateParams((p) => activeCategory === category ? p.delete('category') : p.set('category', category));
  const clearFilters = () => navigate(location, { replace: true });

  const hasActiveFilters = Boolean(query || activeCategory);

  const featuredServices = useMemo(() => {
    return serviceCategories.flatMap(cat =>
      cat.services
        .filter(s => s.featured)
        .map(s => ({ ...s, categorySlug: cat.slug, categoryTitle: cat.title, icon: cat.icon }))
    );
  }, []);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return featuredServices.filter((s) => {
      if (activeCategory && s.categorySlug !== activeCategory) return false;
      if (q) {
        const haystack = [s.name, s.desc, ...(s.benefits || []), s.categoryTitle].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [featuredServices, query, activeCategory]);

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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 premium-gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
              AI-Powered Digital Solutions for Modern Businesses
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
              From intelligent automation to premium software development, TurboByte Tech Solutions delivers scalable, secure and future-ready technology solutions designed to help businesses innovate and grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="glow-purple" asChild>
                <Link href="/start-project">
                  Start Your Project
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full bg-white/[0.05] border-white/10 hover:bg-white/[0.1] transition-all" asChild>
                <Link href="/contact">
                  Talk to Our Experts
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center gap-2 text-primary text-xs font-semibold mb-6 tracking-widest uppercase">
              <TextScramble>WHAT WE DO</TextScramble>
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Our Services</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We combine artificial intelligence, modern software engineering, automation and creativity to build intelligent digital solutions that improve business efficiency, customer experience and long-term growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto bg-white/[0.015] rounded-3xl border border-white/5 p-6 space-y-4 shadow-[0_0_30px_-10px_rgba(124,58,237,0.05)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, benefits, or categories…"
                className="pl-9 bg-card/50 border-white/10"
                aria-label="Search services"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1 font-medium">Category</span>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleCategory(opt.value)}
                  aria-pressed={activeCategory === opt.value}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-white/10 hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
                </p>
                <Button size="sm" variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5 mr-1.5" /> Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-10 md:py-16 bg-white/[0.015] rounded-[2rem] border border-white/5">
              <SearchX className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>No services match those filters</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Try removing a filter or clearing your search to see all available services.</p>
              <Button variant="outline" className="border-white/20" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" /> Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
              {filteredServices.map((service, i) => {
                const isFull = i % 5 === 0 || i % 5 === 4;
                const colSpan = isFull ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4";

                return (
                  <motion.div
                    key={service.name}
                    className={colSpan}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.1 }}
                  >
                    <div className="group relative flex flex-col justify-between p-6 sm:p-8 md:p-10 rounded-[2rem] glass-panel hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(224,188,231,0.15)] overflow-hidden h-full hover-lift">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-[#DCBBE5]/10 transition-colors duration-700" />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-lg mb-8">
                          <service.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>

                        <h3 className="text-2xl font-medium text-white mb-3 tracking-tight group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'var(--app-font-display)' }}>
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground mb-8 font-light leading-relaxed flex-1">
                          {service.desc}
                        </p>

                        {service.benefits && service.benefits.length > 0 && (
                          <div className="mb-8 space-y-3">
                            <h4 className="text-xs uppercase tracking-widest text-white/50 font-semibold mb-4">Key Capabilities</h4>
                            <ul className="space-y-3">
                              {service.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(124,58,237,0)] group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(124,58,237,0.8)] transition-all duration-300" />
                                  <span className="font-light">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-white/10">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Button variant="outline" className="flex-1 rounded-full border-white/10 hover:bg-white/5 bg-transparent" asChild>
                              <Link href={`/services/${service.categorySlug}/${serviceAnchor(service.name)}`}>Learn More</Link>
                            </Button>
                            <Button className="flex-1 rounded-full bg-white text-black hover:bg-white/90 transition-transform hover:scale-105" asChild>
                              <Link href={`/contact?service=${encodeURIComponent(service.name)}`}>Request Quote</Link>
                            </Button>
                          </div>

                          <div className="pt-2">
                            <div className="flex flex-wrap gap-3">
                              {serviceCategories.find(c => c.slug === service.categorySlug)?.services
                                .filter(s => s.name !== service.name)
                                .slice(0, 2)
                                .map(sibling => (
                                  <Link key={sibling.name} href={`/services/${service.categorySlug}/${serviceAnchor(sibling.name)}`} className="text-xs text-white/40 hover:text-primary transition-colors font-medium">
                                    → {sibling.name}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>How We Change <span className="premium-gradient-text">The Game</span></h2>
            <p className="text-xl text-muted-foreground">Compare the impact of TurboByte AI Solutions against conventional approaches.</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-white/10 text-muted-foreground font-medium w-1/4">Compare</th>
                  <th className="p-4 border-b border-white/10 text-muted-foreground font-medium w-1/4">Manual Process</th>
                  <th className="p-4 border-b border-white/10 text-muted-foreground font-medium w-1/4">Traditional Software</th>
                  <th className="p-4 border-b border-white/10 text-primary font-bold w-1/4 text-lg">TurboByte AI Solutions</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 border-b border-white/5 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 border-b border-white/5 text-muted-foreground text-sm">{row.manual}</td>
                    <td className="p-4 border-b border-white/5 text-muted-foreground text-sm">{row.traditional}</td>
                    <td className="p-4 border-b border-white/5 text-primary/90 text-sm font-medium">{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>Our <span className="premium-gradient-text">Process</span></h2>
            <p className="text-xl text-muted-foreground">From initial idea to successful deployment and beyond.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />
            <div className="space-y-6 lg:space-y-0">
              {processSteps.map((step, i) => (
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
                      0{i + 1}
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:w-auto">
                    <div className="bg-white/[0.015] border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors duration-500 hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.1)] group">
                      <div className="flex items-center gap-4 mb-4">
                        <step.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                        <h3 className="text-xl font-medium tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: 'var(--app-font-display)' }}>Why Choose <span className="premium-gradient-text">Our Services</span></h2>
              <div className="flex flex-wrap gap-4">
                {whyChooseUs.map((reason, i) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    <div className="relative bg-white/[0.02] border border-white/10 hover:border-primary/40 px-6 py-3.5 rounded-full flex items-center gap-3 transition-all duration-300">
                      <CheckCircle2 className="w-4 h-4 text-primary group-hover:shadow-[0_0_10px_rgba(124,58,237,0.8)] rounded-full transition-shadow duration-300" strokeWidth={2} />
                      <span className="text-sm font-medium tracking-wide text-white/80 group-hover:text-white transition-colors duration-300">{reason}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <MarketingImage
                src="/images/marketing/mobile-app-ui.jpg"
                alt="Modern mobile app user interface design"
                aspectRatio="portrait"
                imageClassName="object-center"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>Frequently Asked <span className="premium-gradient-text">Questions</span></h2>
          </motion.div>

          <div className="bg-white/[0.015] p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-white/5">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                  <AccordionTrigger className="text-lg hover:text-primary text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-[0.22] mix-blend-luminosity pointer-events-none">
          <img src={`${basePath}/images/marketing/cloud-infrastructure.jpg`} className="w-full h-full object-cover" alt="" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.015] p-6 md:p-12 rounded-[3rem] border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-medium mb-6 tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                Need a Custom Solution?
              </h2>
              <p className="text-xl text-muted-foreground font-light mb-10 leading-relaxed">
                Every business is different. Our experts can design an AI-powered solution tailored specifically to your business goals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 font-medium" asChild>
                  <Link href="/start-project">
                    Start Your Project <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full bg-white/[0.05] border-white/10 hover:bg-white/[0.1] h-14 px-8 font-medium" asChild>
                  <Link href="/contact">
                    Book Free Consultation
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
