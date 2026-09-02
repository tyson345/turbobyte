import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { basePath } from '@/lib/paths';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { ArrowRight } from 'lucide-react';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

export default function Solutions() {
  const seoTitle = 'Industry Solutions for FinTech, Healthcare & Retail';
  const seoDescription =
    'Tailored AI and software solutions for FinTech, Healthcare, Retail, Manufacturing, Government, and Education — built around each industry\u2019s real challenges.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/solutions', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Solutions', path: '/solutions' },
      ]),
    ),
  });

  const solutions = [
    { industry: 'FinTech', pain: 'Fraud, compliance, real-time processing', services: ['AI/ML Fraud Detection', 'Regulatory Compliance', 'Payment Infrastructure'] },
    { industry: 'Healthcare', pain: 'Data silos, HIPAA compliance, patient care', services: ['Healthcare Data Integration', 'HIPAA-Compliant Cloud', 'AI Diagnostics'] },
    { industry: 'Retail', pain: 'Inventory, demand forecasting, customer experience', services: ['Demand Forecasting', 'Personalization', 'Omnichannel Platforms'] },
    { industry: 'Manufacturing', pain: 'Downtime, quality control, supply chain', services: ['Predictive Maintenance', 'Quality Automation', 'IoT Integration'] },
    { industry: 'Government', pain: 'Legacy systems, security, citizen services', services: ['Digital Transformation', 'Cybersecurity', 'Cloud Migration'] },
    { industry: 'Education', pain: 'Remote learning, data management, accessibility', services: ['Learning Platforms', 'Student Analytics', 'EdTech Integration'] },
  ];

  return (
    <div className="min-h-screen">
      <section className="py-10 md:py-16 relative overflow-hidden">
        <AmbientHero />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 premium-gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
                Industry Solutions
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Deep domain expertise across six verticals — we understand your challenges
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-6">
              <MarketingImage
                src="/images/marketing/analytics-dashboard.jpg"
                alt="Data analytics and performance dashboard"
                aspectRatio="video"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 relative bg-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.32] pointer-events-none">
          <img src={`${basePath}/images/marketing/digital-strategy.jpg`} className="w-full h-full object-cover" alt="" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/35 via-transparent to-background/35" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
            {solutions.map((solution, i) => {
              const colSpan =
                i === 0 ? "md:col-span-8 lg:col-span-8" :
                i === 1 ? "md:col-span-4 lg:col-span-4" :
                i === 2 ? "md:col-span-4 lg:col-span-4" :
                i === 3 ? "md:col-span-8 lg:col-span-8" :
                "md:col-span-6 lg:col-span-6";

              return (
                <motion.div key={i} className={colSpan} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}>
                  <div className="group relative glassmorphism bg-background/80 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-[2rem] border border-white/10 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.25)] h-full flex flex-col overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                      <h2 className="text-3xl font-medium mb-3 tracking-tight group-hover:text-primary transition-colors duration-300 drop-shadow-sm text-white" style={{ fontFamily: 'var(--app-font-display)' }}>{solution.industry}</h2>
                      <p className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-8">{solution.pain}</p>

                      <ul className="space-y-4 mb-8 flex-1">
                        {solution.services.map((service, si) => (
                          <li key={si} className="text-base text-white/90 font-light flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 group-hover:bg-primary shadow-[0_0_10px_rgba(124,58,237,0)] group-hover:shadow-[0_0_10px_rgba(124,58,237,0.8)] transition-all duration-300" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-6 border-t border-white/10 mt-auto">
                        <Link href="/contact" className="inline-flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors group/link">
                          Discuss {solution.industry} solutions
                          <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
