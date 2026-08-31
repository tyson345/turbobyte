import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema, faqSchema, SITE_URL } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedGrid } from '@/components/animated-grid';
import { MarketingImage } from '@/components/marketing-image';
import { WhatsAppFloatButton } from '@/components/campaign/whatsapp-float-button';
import { CountdownTimer } from '@/components/campaign/countdown-timer';
import { MobileStickyCta } from '@/components/campaign/mobile-sticky-cta';
import { useSubmitContactInquiry } from '@workspace/api-client-react';
import { useCampaignActive } from '@/hooks/use-campaign-active';
import {
  campaignCopy,
  campaignPackages,
  campaignBonuses,
  campaignBonusTotal,
  campaignProcess,
  campaignFaqs,
  campaignTrustPoints,
  CAMPAIGN_END_DATE,
} from '@/config/campaign';
import {
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Search,
  Gauge,
  Smartphone,
  ShieldCheck,
  Clock,
  FileText,
  Headphones,
  GraduationCap,
  Globe,
  Mail,
  Lock,
  MessageCircleMore,
  MapPin as MapPinIcon,
  Bot,
  AlertCircle,
  CheckCircle,
  Rocket,
  ClipboardList,
  PenTool,
  Code2,
  LifeBuoy,
} from 'lucide-react';
import conceptDental from '@/assets/campaign/concept-dental.jpg';
import conceptRestaurant from '@/assets/campaign/concept-restaurant.jpg';
import conceptInteriors from '@/assets/campaign/concept-interiors.jpg';
import conceptConstruction from '@/assets/campaign/concept-construction.jpg';
import conceptEcommerce from '@/assets/campaign/concept-ecommerce.jpg';
import conceptClinic from '@/assets/campaign/concept-clinic.jpg';

/* --------------------------------- data ---------------------------------- */

const bonusIcons = [Globe, Mail, Lock, MessageCircleMore, MapPinIcon, Bot, LifeBuoy, GraduationCap];

const processIcons = [Search, ClipboardList, PenTool, Code2, Rocket, Headphones];

const industryExamples = [
  { name: 'Dental Clinic', img: conceptDental, desc: 'Appointment booking, treatment pages, WhatsApp reminders.' },
  { name: 'Restaurant', img: conceptRestaurant, desc: 'Menu showcase, table booking, food ordering integration.' },
  { name: 'Interior Design', img: conceptInteriors, desc: 'Portfolio galleries, lead capture, project enquiry forms.' },
  { name: 'Construction', img: conceptConstruction, desc: 'Project showcase, quote requests, service area pages.' },
  { name: 'E-commerce', img: conceptEcommerce, desc: 'Product catalog, cart flow, payment gateway integration.' },
  { name: 'Healthcare Clinic', img: conceptClinic, desc: 'Doctor profiles, appointment scheduling, patient FAQs.' },
];

const whyChoose = [
  { icon: Clock, title: '2–3 Day Delivery', desc: 'Our main pillar — your site goes live in 2–3 days, max 5 for bigger builds. Freedom from waiting.' },
  { icon: FileText, title: 'Written Scope, Always', desc: 'Every project starts with a clear written scope so there are no surprises later.' },
  { icon: ShieldCheck, title: '30-Day Support Included', desc: 'A full month of post-launch support is built into every package, not sold separately.' },
  { icon: MapPinIcon, title: 'Bengaluru-Based Team', desc: 'We work out of Kudlu Gate, Bengaluru — reachable by call, email or WhatsApp.' },
];

/* ------------------------------ animated bits ----------------------------- */

function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1000;
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

  return <span ref={ref}>₹{display.toLocaleString('en-IN')}</span>;
}

const NOT_SURE_PACKAGE = 'not-sure';

/* ---------------------------------- page ---------------------------------- */

export default function OperationTiranga() {
  const active = useCampaignActive();

  useSEO(campaignCopy.metaTitle, campaignCopy.metaDescription, {
    absoluteTitle: true,
    jsonLd: schemaGraph(
      webPageSchema({
        path: '/operation-tiranga',
        title: campaignCopy.metaTitle,
        description: campaignCopy.metaDescription,
      }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Operation Tiranga 2026', path: '/operation-tiranga' },
      ]),
      faqSchema(campaignFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
      {
        '@type': 'OfferCatalog',
        name: 'Operation Tiranga 2026 — Independence Day Website Packages',
        url: `${SITE_URL}/operation-tiranga`,
        itemListElement: campaignPackages.map((pkg, i) => ({
          '@type': 'Offer',
          position: i + 1,
          name: `${pkg.name} Website Package`,
          price: pkg.price,
          priceCurrency: 'INR',
          availability: active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          validThrough: CAMPAIGN_END_DATE,
          url: `${SITE_URL}/operation-tiranga`,
        })),
      },
    ),
  });

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'AI-Powered Website Development',
    budget: '',
    message: '',
    website: '',
  });
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ referenceNumber?: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const submitInquiry = useSubmitContactInquiry({
    mutation: {
      onSuccess: (data) => {
        setSubmitted(data);
        setErrorMsg(null);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setErrorMsg('Too many requests. Please try again later.');
        } else {
          setErrorMsg('Something went wrong submitting your enquiry. Please try again or message us on WhatsApp.');
        }
      },
    },
  });

  const scrollToForm = (packageId?: string) => {
    if (packageId) {
      const pkg = campaignPackages.find((p) => p.id === packageId);
      if (pkg) {
        setSelectedPackage(packageId);
        setFormData((prev) => ({ ...prev, budget: pkg.budgetLabel }));
      }
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.budget || !formData.message) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    const phoneRegex = /^[\d\s+()-]{5,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMsg('Please enter a valid phone number (min 5 characters).');
      return;
    }
    if (!consent) {
      setErrorMsg('Please agree to be contacted about your enquiry.');
      return;
    }

    const pkgLabel = campaignPackages.find((p) => p.id === selectedPackage)?.name;
    const message = `[Operation Tiranga 2026 Campaign]${pkgLabel ? ` Package: ${pkgLabel}.` : ''} ${formData.message}`;

    submitInquiry.mutate({
      data: {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        budget: formData.budget,
        message,
        website: '',
      },
    });
  };

  /* ----------------------------- ended state ----------------------------- */

  if (!active) {
    return (
      <div className="min-h-[100dvh] pt-16 md:pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
        <AnimatedGrid />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
              🇮🇳 Operation Tiranga 2026
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }} data-testid="text-campaign-ended-heading">
              {campaignCopy.endedHeadline}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed" data-testid="text-campaign-ended-body">
              {campaignCopy.endedBody}
            </p>
            <Button asChild size="lg" className="glow-purple">
              <a href="/contact">Talk to Us About Your Project <ArrowRight className="ml-2 w-4 h-4" /></a>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ------------------------------ active state ---------------------------- */

  return (
    <div className="min-h-screen">
      <WhatsAppFloatButton />
      <MobileStickyCta onClaim={() => scrollToForm()} />

      {/* Hero */}
      <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden pt-28 sm:pt-16 md:pt-24">
        <AnimatedGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF9933] via-white/50 to-[#138808]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6"
              data-testid="badge-campaign-name"
            >
              🇮🇳 {campaignCopy.name} · Independence Day Offer
            </motion.div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
              <span className="gradient-text animate-gradient">{campaignCopy.headline}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {campaignCopy.subheadline}
            </p>

            <div className="flex flex-col items-center gap-3 mb-10">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Offer ends 15 August 2026</span>
              <CountdownTimer />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="glow-purple text-lg px-8 py-6" onClick={() => scrollToForm()} data-testid="button-hero-claim-offer">
                Claim Your Offer <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/20 hover:border-primary"
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-hero-view-packages"
              >
                View Packages <ArrowDown className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--app-font-display)' }}>
              Websites starting from <span className="gradient-text"><AnimatedPrice value={4999} /></span>
            </div>

            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {campaignTrustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 md:py-28 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Choose Your <span className="gradient-text">Launch Package</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every package includes a written scope, mobile-responsive build, and 30-day post-launch support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {campaignPackages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300 ${
                  pkg.mostPopular
                    ? 'glassmorphism border-primary shadow-xl shadow-primary/20 lg:-translate-y-3'
                    : 'glassmorphism hover:border-primary/40'
                }`}
                data-testid={`card-package-${pkg.id}`}
              >
                {pkg.mostPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wide whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--app-font-display)' }}>{pkg.name}</h3>
                <div className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>
                  {pkg.priceLabel}
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed min-h-[48px]">{pkg.tagline}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {pkg.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {pkg.deliveryTime}
                </div>
                <Button
                  className={pkg.mostPopular ? 'w-full glow-purple' : 'w-full'}
                  variant={pkg.mostPopular ? 'default' : 'outline'}
                  onClick={() => scrollToForm(pkg.id)}
                  data-testid={`button-select-package-${pkg.id}`}
                >
                  Select {pkg.name}
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Prices exclude GST. GST is added at final invoicing.
          </p>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Limited-Time Bonuses
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Benefits Worth <span className="gradient-text">{campaignBonusTotal}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every package launched during Operation Tiranga includes these extras at no additional cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {campaignBonuses.map((bonus, i) => {
              const Icon = bonusIcons[i % bonusIcons.length];
              return (
                <motion.div
                  key={bonus.title}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.06 }}
                  className="glassmorphism p-5 rounded-xl hover:border-primary/40 transition-all"
                  data-testid={`card-bonus-${i}`}
                >
                  <Icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="text-sm font-semibold mb-1 leading-snug">{bonus.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Worth <span className="text-foreground font-medium">{bonus.value}</span>
                    {bonus.minTier && <span> — higher tiers</span>}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Website Rescue */}
      <section className="py-20 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glassmorphism rounded-2xl p-8 md:p-12 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center border-primary/20"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium mb-4">
                Free Website Audit
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                Already Have a Website? Let's Rescue It.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-xl">
                If your current site is slow, hard to find on Google, or broken on mobile, we'll review it for free — no strings attached — and tell you exactly what to fix.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="w-4 h-4 text-primary shrink-0" /> Speed check
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="w-4 h-4 text-primary shrink-0" /> SEO review
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4 text-primary shrink-0" /> Mobile experience
                </div>
              </div>
            </div>
            <Button size="lg" className="glow-purple whitespace-nowrap" onClick={() => scrollToForm()} data-testid="button-website-rescue-cta">
              Get Free Audit <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Example concepts */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              What We Can <span className="gradient-text">Build For You</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Example concepts across industries — illustrative designs showing what's possible, not delivered client work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industryExamples.map((ex, i) => (
              <motion.div
                key={ex.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="glassmorphism rounded-xl overflow-hidden group hover:border-primary/40 transition-all"
                data-testid={`card-concept-${i}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={ex.img}
                    alt={`${ex.name} example concept`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-medium text-white tracking-wide">
                    EXAMPLE CONCEPT
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--app-font-display)' }}>{ex.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ex.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-20 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                Why Businesses Choose <span className="gradient-text">TurboByte</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                We're a new company — so we lead with transparency, not inflated numbers.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <MarketingImage src="/images/marketing/software-collaboration.jpg" alt="Startup collaboration" aspectRatio="video" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glassmorphism p-7 rounded-xl hover:border-primary/50 transition-all"
              >
                <item.icon className="w-9 h-9 text-primary mb-4" />
                <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Our <span className="gradient-text">Development Process</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A clear, predictable path from first call to launch.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-6 md:p-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              {campaignProcess.map((step, i) => {
                const Icon = processIcons[i % processIcons.length];
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center text-center"
                    data-testid={`step-process-${i}`}
                  >
                    <div className="relative z-10 w-16 h-16 rounded-full glassmorphism border-primary/40 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-primary font-mono mb-1">0{i + 1}</span>
                    <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: 'var(--app-font-display)' }}>{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section ref={formRef} id="claim-offer" className="py-20 md:py-28 bg-card/50 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                Claim Your <span className="gradient-text">Independence Day Offer</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Tell us about your business — we'll respond within 24 business hours.
              </p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glassmorphism p-8 sm:p-6 md:p-10 rounded-xl text-center border-primary/30"
                data-testid="panel-submission-success"
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Your Enquiry Is In!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've received your Operation Tiranga enquiry and will reach out within 24 business hours.
                </p>
                {submitted.referenceNumber && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 inline-block">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference Number</p>
                    <p className="text-xl font-mono text-primary font-bold" data-testid="text-reference-number">
                      {submitted.referenceNumber}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="glassmorphism p-6 sm:p-6 sm:p-8 md:p-10 rounded-xl space-y-6"
                data-testid="form-campaign-lead"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      data-testid="input-campaign-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Name</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your business name"
                      data-testid="input-campaign-company"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@business.com"
                      data-testid="input-campaign-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone *</label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Your phone number"
                      data-testid="input-campaign-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Package *</label>
                  <Select
                    value={selectedPackage}
                    onValueChange={(val) => {
                      setSelectedPackage(val);
                      const pkg = campaignPackages.find((p) => p.id === val);
                      setFormData((prev) => ({
                        ...prev,
                        budget: pkg ? pkg.budgetLabel : 'Not sure yet — need guidance',
                      }));
                    }}
                  >
                    <SelectTrigger data-testid="select-campaign-package">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent className="glassmorphism border-white/10">
                      {campaignPackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.priceLabel}
                        </SelectItem>
                      ))}
                      <SelectItem value={NOT_SURE_PACKAGE}>Not sure yet — need guidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Project Details *</label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your business and what you need — a new website, a redesign, WhatsApp automation, etc."
                    rows={5}
                    data-testid="textarea-campaign-message"
                  />
                </div>

                {/* Honeypot field — invisible to humans, catches bots */}
                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  <label htmlFor="campaign-website">Website</label>
                  <input
                    id="campaign-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="campaign-consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                    data-testid="checkbox-campaign-consent"
                  />
                  <label htmlFor="campaign-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to be contacted by TurboByte Tech Solutions about this offer via email, phone or WhatsApp. *
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full glow-purple"
                  disabled={submitInquiry.isPending}
                  data-testid="button-submit-campaign-form"
                >
                  {submitInquiry.isPending ? 'Submitting…' : 'Claim My Independence Day Offer'}
                </Button>

                {errorMsg && (
                  <p className="text-sm text-red-400 flex items-center justify-center gap-2" data-testid="text-campaign-form-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  We respond within 24 business hours. No spam, ever.
                </p>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about the Operation Tiranga offer.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {campaignFaqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="glassmorphism rounded-lg px-6 border border-white/10 data-[state=open]:border-primary/50 transition-colors"
                  data-testid={`faq-campaign-item-${i}`}
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden pb-32 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Don't Let the Countdown Run Out
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Operation Tiranga 2026 ends 15 August. After that, prices return to standard rates.
            </p>
            <Button size="lg" className="glow-purple text-lg px-8 py-6" onClick={() => scrollToForm()} data-testid="button-final-cta-claim">
              Claim Offer Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
