import { useState, useRef, useEffect } from 'react';

const MAX_IMAGES = 2;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sparkles, Maximize2, X, Loader2, AlertCircle, CheckCircle2, Zap, Send, ImagePlus } from 'lucide-react';
import { useGenerateDemoPrototype, useSubmitDemoInquiry } from '@workspace/api-client-react';
import { MarketingImage } from '@/components/marketing-image';
import type { DemoPrototypeResult } from '@workspace/api-client-react';
import { TextScramble } from '@/components/core/text-scramble';
import { TextLoop } from '@/components/core/text-loop';
import { AmbientHero } from '@/components/ambient-hero';

const PROGRESS_MESSAGES = [
  { text: 'Analyzing your vision...', delay: 0 },
  { text: 'Architecting the structure...', delay: 8000 },
  { text: 'Designing the interface...', delay: 16000 },
  { text: 'Bringing it to life...', delay: 28000 },
  { text: 'Polishing the details...', delay: 40000 },
];

export default function Demo() {
  const seoTitle = 'AI Demo - Watch Your Idea Come to Life';
  const seoDescription =
    'Describe your project in one line and watch us build a working prototype in real-time. Experience the future of development with TurboByte.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/demo', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'AI Demo', path: '/demo' },
      ]),
    ),
  });

  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<
    { name: string; mediaType: (typeof ALLOWED_IMAGE_TYPES)[number]; data: string; previewUrl: string }[]
  >([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const [prototype, setPrototype] = useState<DemoPrototypeResult | null>(null);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ referenceNumber?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    budget: '',
    timeline: '',
    details: '',
    website: '',
  });

  // Erase the generated prototype on the server when the visitor leaves the
  // page without submitting it as an inquiry.
  const prototypeIdRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  prototypeIdRef.current = prototype?.prototypeId ?? null;
  submittedRef.current = submittedData !== null;
  useEffect(() => {
    const discard = () => {
      if (prototypeIdRef.current && !submittedRef.current) {
        navigator.sendBeacon(`/api/demo/prototypes/${prototypeIdRef.current}/discard`);
        prototypeIdRef.current = null;
      }
    };
    window.addEventListener('pagehide', discard);
    return () => {
      window.removeEventListener('pagehide', discard);
      // Also fires on client-side navigation away from /demo
      discard();
    };
  }, []);

  const generateMutation = useGenerateDemoPrototype({
    mutation: {
      onSuccess: (data) => {
        setPrototype(data);
        setErrorMsg(null);
        setCurrentMessageIndex(0);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setErrorMsg('Too many requests. Please try again in a few minutes.');
        } else if (err?.status === 502) {
          setErrorMsg('Generation failed. Please try a different prompt or try again later.');
        } else {
          setErrorMsg('Something went wrong. Please try again.');
        }
      },
    },
  });

  const submitMutation = useSubmitDemoInquiry({
    mutation: {
      onSuccess: (data) => {
        setSubmittedData(data);
        setErrorMsg(null);
        setShowInquiryForm(false);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setErrorMsg('Too many requests. Please try again later.');
        } else {
          setErrorMsg('Failed to submit. Please try again or contact us directly.');
        }
      },
    },
  });

  // Bring the progress card into view when generation starts, so visitors
  // don't have to scroll to see that something is happening.
  useEffect(() => {
    if (generateMutation.isPending) {
      const t = setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [generateMutation.isPending]);

  // Progress message animation
  useEffect(() => {
    if (!generateMutation.isPending) {
      setCurrentMessageIndex(0);
      return;
    }

    const timers = PROGRESS_MESSAGES.map((msg, index) => {
      return setTimeout(() => {
        if (generateMutation.isPending) {
          setCurrentMessageIndex(index);
        }
      }, msg.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [generateMutation.isPending]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5) {
      setErrorMsg('Please describe your idea (at least 5 characters).');
      return;
    }
    if (prompt.length > 200) {
      setErrorMsg('Please keep your prompt under 200 characters.');
      return;
    }
    setErrorMsg(null);
    setPrototype(null);
    generateMutation.mutate({
      data: {
        prompt: prompt.trim(),
        ...(images.length > 0
          ? { images: images.map((img) => ({ mediaType: img.mediaType, data: img.data })) }
          : {}),
        website: '',
      },
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      if (images.length + 1 > MAX_IMAGES) {
        setErrorMsg(`You can attach up to ${MAX_IMAGES} images.`);
        return;
      }
      if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setErrorMsg('Please upload a JPG, PNG, WebP or GIF image.');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setErrorMsg('Each image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.split(',')[1] || '';
        setImages((prev) =>
          prev.length >= MAX_IMAGES
            ? prev
            : [...prev, { name: file.name, mediaType: file.type as (typeof ALLOWED_IMAGE_TYPES)[number], data: base64, previewUrl: result }],
        );
      };
      reader.readAsDataURL(file);
    }
    setErrorMsg(null);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prototype) return;

    if (!formData.name || !formData.email || !formData.phone) {
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
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setErrorMsg(null);
    submitMutation.mutate({
      data: {
        prototypeId: prototype.prototypeId,
        prompt,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || undefined,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
        details: formData.details || undefined,
        website: '',
      },
    });
  };

  const remainingChars = 200 - prompt.length;

  return (
    <div className="min-h-[100dvh] pt-20">
      {/* Success Dialog */}
      <Dialog open={!!submittedData} onOpenChange={(open) => !open && setSubmittedData(null)}>
        <DialogContent className="sm:max-w-md glassmorphism border-white/10 text-center p-8 sm:p-6 md:p-10 text-foreground">
          <DialogHeader>
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <DialogTitle className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>
              We'll Be In Touch
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-muted-foreground">
              Your prototype request has been sent to our team.
            </DialogDescription>
          </DialogHeader>
          {submittedData?.referenceNumber && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reference Number</p>
              <p className="text-xl font-mono text-primary font-bold">{submittedData.referenceNumber}</p>
            </div>
          )}
          <p className="text-muted-foreground mt-2">
            Our team will contact you within one business day to discuss your project.
          </p>
        </DialogContent>
      </Dialog>

      {/* Inquiry Form Dialog */}
      <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
        <DialogContent className="sm:max-w-2xl glassmorphism border-white/10 text-foreground max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'var(--app-font-display)' }}>
              Send This to Our Team
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Let's turn this prototype into reality. Share your details and we'll reach out within one business day.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInquirySubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  data-testid="input-inquiry-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  data-testid="input-inquiry-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Phone *</label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  data-testid="input-inquiry-phone"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company"
                  data-testid="input-inquiry-company"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Range</label>
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. $10k-$50k"
                  data-testid="input-inquiry-budget"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Timeline</label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g. 2-3 months"
                  data-testid="input-inquiry-timeline"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Details</label>
              <Textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Tell us more about your project, goals, or requirements..."
                rows={4}
                data-testid="textarea-inquiry-details"
              />
            </div>

            {/* Honeypot */}
            <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
              <label htmlFor="inquiry-website">Website</label>
              <input
                id="inquiry-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInquiryForm(false)}
                className="flex-1"
                data-testid="button-inquiry-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 glow-purple"
                disabled={submitMutation.isPending}
                data-testid="button-inquiry-submit"
              >
                {submitMutation.isPending ? 'Sending...' : 'Send to Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expanded Preview Dialog */}
      <Dialog open={expandedPreview} onOpenChange={setExpandedPreview}>
        <DialogContent className="max-w-[95vw] w-full h-[95dvh] p-0 glassmorphism border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <DialogTitle className="text-lg font-semibold" style={{ fontFamily: 'var(--app-font-display)' }}>
              Prototype Preview
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPreview(false)}
              data-testid="button-close-preview"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="w-full h-[calc(95dvh-73px)] bg-white">
            {prototype && (
              <iframe
                srcDoc={prototype.html}
                sandbox="allow-scripts"
                className="w-full h-full"
                title="Prototype preview expanded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <section className="py-8 md:py-12 relative overflow-hidden">
        <AmbientHero />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism mb-5"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                <TextScramble>AI-POWERED PROTOTYPE GENERATION</TextScramble>
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text leading-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
              Watch Your Idea Come to Life
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              Describe your project in one sentence. Watch us build a working prototype in real-time.
              <br />
              <span className="text-base md:text-lg text-muted-foreground/80">No meetings. No estimates. Just magic.</span>
            </p>

            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              <form onSubmit={handleGenerate} className="relative">
                <div className="bg-white/[0.03] border border-white/10 p-2 md:p-3 rounded-[2rem] shadow-[0_0_40px_-10px_rgba(124,58,237,0.3)] backdrop-blur-md relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-focus-within:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
                  <div className="relative flex flex-col sm:block gap-2 z-10">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A task manager for remote teams with real-time collaboration..."
                      className="text-base md:text-lg h-14 md:h-16 pr-12 sm:pr-44 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      maxLength={200}
                      disabled={generateMutation.isPending}
                      data-testid="input-prompt"
                    />
                    <div className="flex items-center justify-between gap-2 sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 sm:justify-end">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${remainingChars < 20 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {remainingChars}
                      </span>
                      <Button
                        type="submit"
                        disabled={generateMutation.isPending || prompt.trim().length < 5}
                        className="h-10 md:h-12 px-6 font-semibold"
                        data-testid="button-generate"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />
                            Building
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Reference images (optional) */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  <div className="hidden sm:flex items-center text-xs text-muted-foreground mr-2 font-mono">
                    Try:{' '}
                    <TextLoop className="ml-2 text-white/70" interval={3}>
                      <span>"A task manager for remote teams..."</span>
                      <span>"A modern bakery e-commerce site..."</span>
                      <span>"A portfolio for a 3D artist..."</span>
                      <span>"An AI agent for clinic bookings..."</span>
                    </TextLoop>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                    data-testid="input-reference-images"
                  />
                  {images.map((img, i) => (
                    <div key={`${img.name}-${i}`} className="relative group">
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-14 h-14 rounded-lg object-cover border border-white/15"
                        data-testid={`img-reference-${i}`}
                      />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-white/20 flex items-center justify-center text-muted-foreground hover:text-white"
                        aria-label={`Remove ${img.name}`}
                        data-testid={`button-remove-image-${i}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={generateMutation.isPending}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                      data-testid="button-add-images"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {images.length === 0 ? 'Add reference images (logo, sketch — optional)' : 'Add another image'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-left">
                  Generation takes 30-60 seconds. Be specific for best results — you can also attach your logo or a design you like.
                </p>
              </form>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 mt-4"
                  data-testid="text-error"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Generation Progress */}
      <AnimatePresence>
        {generateMutation.isPending && (
          <motion.section
            ref={progressRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="py-8 md:py-12"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/[0.015] border border-white/5 p-6 sm:p-10 md:p-16 rounded-[3rem] text-center shadow-[0_0_50px_-10px_rgba(124,58,237,0.1)]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-6"
                  >
                    <Sparkles className="w-full h-full text-primary" />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMessageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                        <TextScramble characterSet=". " duration={1.2}>
                          {PROGRESS_MESSAGES[currentMessageIndex].text}
                        </TextScramble>
                      </h3>
                    </motion.div>
                  </AnimatePresence>

                  <p className="text-muted-foreground mb-8">
                    This usually takes 30-60 seconds. We're crafting something special for you.
                  </p>

                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 60, ease: 'linear' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Prototype Preview */}
      <AnimatePresence>
        {prototype && !generateMutation.isPending && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="py-10 md:py-24"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
                    Your Prototype is Ready
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    This is a working preview based on: <span className="text-foreground font-medium">"{prompt}"</span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                >
                  <div className="bg-card/50 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-sm text-muted-foreground font-mono hidden sm:block">prototype.html</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPreview(true)}
                      className="gap-2"
                      data-testid="button-expand-preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Expand</span>
                    </Button>
                  </div>

                  <div className="w-full h-[500px] md:h-[600px] bg-white">
                    <iframe
                      srcDoc={prototype.html}
                      sandbox="allow-scripts"
                      className="w-full h-full"
                      title="Prototype preview"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Button
                    onClick={() => setShowInquiryForm(true)}
                    size="lg"
                    className="glow-purple gap-2 text-lg h-14 px-8 w-full sm:w-auto"
                    data-testid="button-send-to-team"
                  >
                    <Send className="w-5 h-5" />
                    I Like It — Send to Team
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPrototype(null);
                      setPrompt('');
                      setErrorMsg(null);
                    }}
                    size="lg"
                    className="h-14 px-8 w-full sm:w-auto"
                    data-testid="button-try-another"
                  >
                    Try Another Idea
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trust Section */}
      {!prototype && !generateMutation.isPending && (
        <section className="py-10 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                  Why Try Our AI Demo?
                </h2>
                <p className="text-muted-foreground">
                  See what's possible before committing to anything
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <MarketingImage
                  src="/images/marketing/design-workshop.jpg"
                  alt="Interactive design workshop"
                  aspectRatio="wide"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Instant Visualization',
                    description: 'See your idea as a working interface in under 60 seconds',
                  },
                  {
                    title: 'No Commitment',
                    description: 'Try as many ideas as you want. No sign-up, no credit card.',
                  },
                  {
                    title: 'Real AI Power',
                    description: 'This is the same technology we use for client projects',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glassmorphism p-6 rounded-xl"
                  >
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
