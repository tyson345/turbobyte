import { useState, useEffect, useMemo } from 'react';
import { useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { basePath } from '@/lib/paths';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Check, ChevronsUpDown, MessageCircle } from 'lucide-react';
import { useSubmitContactInquiry } from '@workspace/api-client-react';
import { SocialLinks } from '@/components/social-links';
import { siteConfig, trustItems, hasAnySocial } from '@/config/site';
import { contactServiceOptions, budgetOptions } from '@/config/services';
import { cn } from '@/lib/utils';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

export default function Contact() {
  const seoTitle = 'Contact TurboByte Tech Solutions';
  const seoDescription =
    'Want a website for your business? Contact TurboByte, a website creation company in Bengaluru — get a quote for your website, app, or automation project. We respond within 24 business hours.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/contact', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ]),
    ),
  });

  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const rawService = params.get('service') || '';

  const defaultService = contactServiceOptions.includes(rawService) ? rawService : '';

  const [submittedData, setSubmittedData] = useState<{ referenceNumber?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: defaultService,
    budget: '',
    message: '',
    website: '',
  });
  const [consent, setConsent] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  useEffect(() => {
    if (defaultService && formData.service !== defaultService) {
      setFormData(prev => ({ ...prev, service: defaultService }));
    }
  }, [defaultService]);

  const submitInquiry = useSubmitContactInquiry({
    mutation: {
      onSuccess: (data) => {
        setSubmittedData(data);
        setErrorMsg(null);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setErrorMsg("Too many requests. Please try again later.");
        } else {
          setErrorMsg("Something went wrong sending your message. Please try again or email us directly.");
        }
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.service || !formData.budget || !formData.message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    const phoneRegex = /^[\d\s+()-]{5,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMsg("Please enter a valid phone number (min 5 characters).");
      return;
    }
    if (!consent) {
      setErrorMsg("Please agree to be contacted about your enquiry.");
      return;
    }

    submitInquiry.mutate({ data: formData });
  };

  return (
    <div className="min-h-screen pt-20">
      <Dialog open={!!submittedData} onOpenChange={(open) => !open && setSubmittedData(null)}>
        <DialogContent className="sm:max-w-md glassmorphism border-white/10 text-center p-8 sm:p-6 md:p-10 text-foreground">
          <DialogHeader>
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <DialogTitle className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-muted-foreground">
              Your enquiry has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          {submittedData?.referenceNumber && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reference Number</p>
              <p className="text-xl font-mono text-primary font-bold">{submittedData.referenceNumber}</p>
            </div>
          )}
          <p className="text-muted-foreground mt-2">
            We will contact you within 24 business hours.
          </p>
        </DialogContent>
      </Dialog>
      {/* Hero */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        <AmbientHero />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 premium-gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
              Let's Build Something Extraordinary
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Whether you're exploring AI possibilities or ready to transform your business, we're here to help
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pt-2 pb-10 md:pb-20 relative overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-[0.04] mix-blend-luminosity pointer-events-none">
          <img src={`${basePath}/images/marketing/software-collaboration.jpg`} className="w-full h-full object-cover" alt="" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:p-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="glassmorphism p-6 sm:p-6 sm:p-8 md:p-10 rounded-xl">
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your company name"
                        data-testid="input-company"
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
                        placeholder="you@company.com"
                        data-testid="input-email"
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
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-2 block">Service Interest *</label>
                      <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={serviceOpen}
                            className="w-full justify-between font-normal"
                            data-testid="select-service"
                          >
                            <span className="truncate">
                              {formData.service || "Select a service"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 glassmorphism border-white/10" align="start">
                          <Command>
                            <CommandInput placeholder="Search services..." />
                            <CommandList>
                              <CommandEmpty>No service found.</CommandEmpty>
                              <CommandGroup>
                                {contactServiceOptions.map((service) => (
                                  <CommandItem
                                    key={service}
                                    value={service}
                                    onSelect={(currentValue) => {
                                      // CommandItem value is always lowercase, so we need to match the original
                                      const originalValue = contactServiceOptions.find(
                                        (s) => s.toLowerCase() === currentValue.toLowerCase()
                                      ) || service;
                                      setFormData({ ...formData, service: originalValue });
                                      setServiceOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.service === service ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {service}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-2 block">Project Budget *</label>
                      <Popover open={budgetOpen} onOpenChange={setBudgetOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={budgetOpen}
                            className="w-full justify-between font-normal"
                            data-testid="select-budget"
                          >
                            <span className="truncate">
                              {formData.budget || "Select budget range"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 glassmorphism border-white/10" align="start">
                          <Command>
                            <CommandInput placeholder="Search budgets..." />
                            <CommandList>
                              <CommandEmpty>No budget found.</CommandEmpty>
                              <CommandGroup>
                                {budgetOptions.map((budget) => (
                                  <CommandItem
                                    key={budget}
                                    value={budget}
                                    onSelect={(currentValue) => {
                                      const originalValue = budgetOptions.find(
                                        (b) => b.toLowerCase() === currentValue.toLowerCase()
                                      ) || budget;
                                      setFormData({ ...formData, budget: originalValue });
                                      setBudgetOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.budget === budget ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {budget}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your project..."
                      rows={5}
                      data-testid="textarea-message"
                    />
                  </div>

                  {/* Honeypot field — invisible to humans, catches bots */}
                  <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="contact-consent"
                      checked={consent}
                      onCheckedChange={(v) => setConsent(v === true)}
                      className="mt-0.5"
                      data-testid="checkbox-contact-consent"
                    />
                    <label htmlFor="contact-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to be contacted by TurboByte Tech Solutions about my enquiry via email, phone or WhatsApp. *
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full glow-purple"
                    disabled={submitInquiry.isPending}
                    data-testid="button-submit"
                  >
                    {submitInquiry.isPending ? 'Sending…' : 'Send Message'}
                  </Button>

                  {errorMsg && (
                    <p className="text-sm text-red-400 flex items-center justify-center gap-2" data-testid="text-contact-error">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errorMsg}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    We respond within 24 business hours to all inquiries
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Get in Touch
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Have questions about our services, pricing, or capabilities? Our team is ready to help you find the right solution for your business.
                </p>
              </div>

              <div className="glassmorphism p-6 sm:p-8 rounded-xl divide-y divide-white/5">
                <div className="flex items-start gap-4 pb-5">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Business Email</h3>
                    <a href={siteConfig.emailHref} className="text-muted-foreground hover:text-primary transition-colors break-all" data-testid="link-contact-email">
                      {siteConfig.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-5">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Phone Number</h3>
                    <a href={siteConfig.phoneHref} className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact-phone">
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-5">
                  <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">WhatsApp</h3>
                    <a
                      href={siteConfig.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-contact-whatsapp"
                    >
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-5">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Business Hours</h3>
                    <p className="text-muted-foreground">{siteConfig.businessHours.days}, {siteConfig.businessHours.hours}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{siteConfig.responseTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-5">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Address</h3>
                    <a
                      href={siteConfig.address.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors leading-relaxed block"
                      data-testid="link-contact-address"
                    >
                      {siteConfig.address.lines.map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < siteConfig.address.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </a>
                    <a
                      href={siteConfig.address.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                      data-testid="link-contact-map"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>

              {/* Trust Card */}
              <div className="glassmorphism p-8 rounded-xl" data-testid="card-trust">
                <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Why Businesses Trust TurboByte
                </h3>
                <ul className="space-y-3">
                  {trustItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {hasAnySocial() && (
                <div className="glassmorphism p-8 rounded-xl">
                  <h3 className="font-semibold mb-4">Connect With Us</h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <SocialLinks variant="circle" />
                  </div>
                </div>
              )}
              <MarketingImage
                src="/images/marketing/digital-ads.jpg"
                alt="Digital marketing and advertising strategy dashboard"
                aspectRatio="video"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
