import { useState, useEffect, useMemo } from 'react';
import { useSearch } from 'wouter';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { contactServiceOptions, budgetOptions } from '@/config/services';
import { useSubmitProjectInquiry } from '@workspace/api-client-react';
import { TextScramble } from '@/components/core/text-scramble';
import { TextRoll } from '@/components/core/text-roll';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

/**
 * Plain-language options so non-technical visitors can pick what they need
 * without knowing service jargon. Each maps to real service names on submit.
 */
const NEED_OPTIONS: { label: string; hint: string; service: string }[] = [
  { label: 'A website for my business', hint: 'Show your business online', service: 'Website Development' },
  { label: 'An online store', hint: 'Sell products online', service: 'E-commerce Solutions' },
  { label: 'A mobile app', hint: 'Android / iPhone app', service: 'Mobile App Development' },
  { label: 'Fix or improve my current website', hint: 'Redesign, speed-up, or repair', service: 'Website Development' },
  { label: 'AI features / chatbot', hint: 'Smart automation for your business', service: 'AI & Automation' },
  { label: 'Get found on Google', hint: 'SEO & digital marketing', service: 'Digital Marketing & SEO' },
  { label: 'Something else / not sure', hint: "We'll help you figure it out", service: '' },
];

const TIMELINE_OPTIONS = ['As soon as possible', 'Within 2 weeks', 'Within a month', 'Just exploring'];

const NOT_SURE_BUDGET = 'Not sure yet';

export default function StartProject() {
  const seoTitle = 'Start Your Project with TurboByte Tech Solutions';
  const seoDescription =
    'Need a website built for your business? Tell us your requirements and TurboByte — a website creation and development company in Bengaluru — will shape a plan and get you live in days.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/start-project', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Start Your Project', path: '/start-project' },
      ]),
    ),
  });

  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const defaultServicesParam = params.get('services');

  // Pre-select plain-language needs when arriving via a service page link.
  const defaultNeeds = useMemo(() => {
    if (!defaultServicesParam) return [];
    const wanted = defaultServicesParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => contactServiceOptions.includes(s));
    return NEED_OPTIONS.filter((n) => n.service && wanted.includes(n.service)).map((n) => n.label);
  }, [defaultServicesParam]);

  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState<{ referenceNumber?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    needs: defaultNeeds as string[],
    description: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
  });

  useEffect(() => {
    if (defaultNeeds.length > 0 && formData.needs.length === 0) {
      setFormData((prev) => ({ ...prev, needs: defaultNeeds }));
    }
  }, [defaultNeeds]);

  const totalSteps = 2;

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (formData.needs.length === 0) {
        setError('Please pick at least one option — "Something else / not sure" works too.');
        return;
      }
      if (formData.description.trim().length < 10) {
        setError('Please tell us a little about what you want (a couple of lines is enough).');
        return;
      }
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitInquiry = useSubmitProjectInquiry({
    mutation: {
      onSuccess: (data) => {
        setSubmittedData(data);
        setError(null);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError(
            err.status === 400
              ? 'Please make sure your details are filled in correctly.'
              : 'Something went wrong submitting your project. Please try again.'
          );
        }
      },
    },
  });

  const handleSubmit = () => {
    setError(null);
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    if (!name || !email || !phone) {
      setError('Please fill in your name, email and phone number.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (!/^[\d\s+()-]{5,}$/.test(phone) || digits.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }

    const services = Array.from(
      new Set(
        formData.needs
          .map((label) => NEED_OPTIONS.find((n) => n.label === label)?.service)
          .filter((s): s is string => !!s),
      ),
    );

    submitInquiry.mutate({
      data: {
        projectName: formData.needs[0] || 'New project',
        description: `Needs: ${formData.needs.join(', ')}\n\n${formData.description.trim()}`,
        industry: 'Not specified',
        services,
        budget: formData.budget || undefined,
        timeline: formData.timeline || 'Not sure yet',
        name,
        company: formData.company.trim() || 'Individual / Not specified',
        email,
        phone,
        website: formData.website,
      },
    });
  };

  const toggleNeed = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(label)
        ? prev.needs.filter((n) => n !== label)
        : [...prev.needs, label],
    }));
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen pt-20 bg-background text-foreground overflow-hidden">
        {submittedData ? (
          <section className="py-12 md:py-24 relative flex items-center justify-center min-h-[calc(100vh-80px)]">
            <AmbientHero />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center px-4 bg-card border border-white/5 p-6 sm:p-8 md:p-16 rounded-[3rem] relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                  <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-medium mb-6 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Request Received
                </h1>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-light">
                  Thank you for reaching out. Our team will review your requirements and contact you within 24 business hours with the next steps.
                </p>

                {submittedData.referenceNumber && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 max-w-sm mx-auto mb-10">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Reference Number</p>
                    <p className="text-2xl font-mono text-white font-medium">{submittedData.referenceNumber}</p>
                  </div>
                )}

                <Button size="lg" onClick={() => window.location.href = '/'} className="rounded-full h-14 px-10 text-lg bg-white text-black hover:bg-white/90 transition-transform hover:scale-105">
                  Return Home
                </Button>
              </div>
            </motion.div>
          </section>
        ) : (
          <section className="py-12 md:py-24 relative overflow-hidden">
            <AmbientHero />
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold mb-6 tracking-widest uppercase">
                    <TextScramble>PROJECT INTAKE</TextScramble>
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium mb-6 text-white tracking-tight leading-[1.05]" style={{ fontFamily: 'var(--app-font-display)' }}>
                    <TextRoll>Start Your Project</TextRoll>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10">
                    Two quick steps — tell us what you need, and we'll get in touch within 24 hours to formulate a plan.
                  </p>

                  <MarketingImage
                    src="/images/marketing/developer-workspace.jpg"
                    alt="Project planning"
                    aspectRatio="wide"
                  />
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      Step {step} of {totalSteps}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {step === 1 ? 'Your Requirements' : 'Contact Details'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / totalSteps) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    />
                  </div>
                </div>

                {/* Form Steps */}
                <div className="bg-card border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none transition-opacity duration-700 group-hover:opacity-100" />

                  <AnimatePresence mode="wait">
                    {/* Step 1: What do you need */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-10 relative z-10"
                      >
                        <div>
                          <h2 className="text-2xl font-medium mb-3 flex items-center gap-3 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                            <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
                            What do you need?
                          </h2>
                          <p className="text-muted-foreground text-sm font-light">Select everything that applies — don't worry about exact technical terms.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {NEED_OPTIONS.map((option) => {
                            const selected = formData.needs.includes(option.label);
                            return (
                              <button
                                key={option.label}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleNeed(option.label)}
                                className={`group/btn relative p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                  selected
                                    ? 'bg-primary/[0.05] border-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                                    : 'bg-white/[0.015] border-white/5 hover:border-primary/30 hover:bg-white/[0.03]'
                                }`}
                                data-testid={`option-need-${option.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              >
                                {selected && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                                )}
                                <div className="relative z-10 flex items-start gap-4">
                                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                    selected ? 'border-primary' : 'border-white/20 group-hover/btn:border-primary/50'
                                  }`}>
                                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                  </div>
                                  <div>
                                    <span className={`font-medium block mb-1 tracking-tight transition-colors ${selected ? 'text-primary' : 'text-white'}`}>{option.label}</span>
                                    <span className="text-sm text-muted-foreground font-light">{option.hint}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-3 block text-white/90">Tell us about it in your own words *</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Example: I run a bakery in Bengaluru and want a website where customers can see my cakes and place orders on WhatsApp..."
                            rows={4}
                            className="bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl resize-none font-light text-base p-4 placeholder:text-muted-foreground/50 transition-colors"
                            data-testid="textarea-description"
                          />
                          <p className="text-xs text-muted-foreground mt-3 font-light">A couple of lines is enough — any language is fine.</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-3 block text-white/90">Rough budget (optional)</label>
                          <div className="flex flex-wrap gap-3">
                            {[...budgetOptions, NOT_SURE_BUDGET].map((budget) => (
                              <button
                                key={budget}
                                type="button"
                                aria-pressed={formData.budget === budget}
                                onClick={() => setFormData({ ...formData, budget: formData.budget === budget ? '' : budget })}
                                className={`px-5 py-2.5 rounded-full border text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                  formData.budget === budget
                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                    : 'bg-white/[0.02] border-white/10 text-white/80 hover:text-white hover:border-primary/40'
                                }`}
                                data-testid={`option-budget-${budget === NOT_SURE_BUDGET ? 'not-sure' : budget}`}
                              >
                                {budget}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-3 block text-white/90">When do you want it? (optional)</label>
                          <div className="flex flex-wrap gap-3">
                            {TIMELINE_OPTIONS.map((timeline) => (
                              <button
                                key={timeline}
                                type="button"
                                aria-pressed={formData.timeline === timeline}
                                onClick={() => setFormData({ ...formData, timeline: formData.timeline === timeline ? '' : timeline })}
                                className={`px-5 py-2.5 rounded-full border text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                  formData.timeline === timeline
                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                    : 'bg-white/[0.02] border-white/10 text-white/80 hover:text-white hover:border-primary/40'
                                }`}
                              >
                                {timeline}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8 relative z-10"
                      >
                        <div>
                          <h2 className="text-2xl font-medium mb-3 flex items-center gap-3 text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                            <Phone className="w-6 h-6 text-primary" strokeWidth={1.5} />
                            How can we reach you?
                          </h2>
                          <p className="text-muted-foreground text-sm font-light">We'll call or email you within 24 business hours. No spam, ever.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium mb-3 block text-white/90">Your Name *</label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Your full name"
                              className="bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl h-12 px-4 font-light transition-colors"
                              data-testid="input-contact-name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-3 block text-white/90">Phone *</label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="Your phone / WhatsApp number"
                              className="bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl h-12 px-4 font-light transition-colors"
                              data-testid="input-contact-phone"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium mb-3 block text-white/90">Email *</label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="you@example.com"
                              className="bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl h-12 px-4 font-light transition-colors"
                              data-testid="input-contact-email"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-3 block text-white/90">Business / Shop name (optional)</label>
                            <Input
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              placeholder="e.g., Sri Ganesh Bakery"
                              className="bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl h-12 px-4 font-light transition-colors"
                              data-testid="input-contact-company"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Honeypot field — invisible to humans, catches bots */}
                  <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                    <label htmlFor="project-website">Website</label>
                    <input
                      id="project-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive-foreground flex items-start gap-3 relative z-10"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p role="alert" data-testid="text-project-error" className="leading-relaxed font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/10 relative z-10">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="w-full sm:w-auto rounded-full border-white/10 hover:bg-white/5 bg-transparent h-12 px-8 font-medium transition-colors"
                      data-testid="button-back"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    {step < totalSteps ? (
                      <Button
                        onClick={handleNext}
                        className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-white/90 h-12 px-10 font-medium transition-transform hover:scale-105"
                        data-testid="button-next"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitInquiry.isPending}
                        className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 font-medium transition-transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                        data-testid="button-submit-project"
                      >
                        {submitInquiry.isPending ? 'Submitting…' : 'Submit Request'}
                        {!submitInquiry.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-8 font-light">
                  Prefer to talk? Call or WhatsApp us at{' '}
                  <a href="tel:+917019793408" className="text-primary hover:underline font-medium">+91 70197 93408</a>
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </MotionConfig>
  );
}
