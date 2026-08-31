import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubscribeNewsletter } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const subscribe = useSubscribeNewsletter({
    mutation: {
      onSuccess: (data) => {
        setMessage({
          kind: 'success',
          text:
            data.status === 'already_subscribed'
              ? "You're already on the list — thank you!"
              : "You're subscribed! We'll keep you posted.",
        });
        setEmail('');
      },
      onError: () => {
        setMessage({
          kind: 'error',
          text: "We couldn't subscribe that address. Please check it and try again.",
        });
      },
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setMessage(null);
    subscribe.mutate({ data: { email: value } });
  };

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glassmorphism rounded-2xl p-6 md:p-10 sm:p-14 max-w-3xl mx-auto text-center"
        >
          <Mail className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
            Stay Ahead with <span className="premium-gradient-text">AI Insights</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Practical ideas on AI, automation, and digital growth — straight to your inbox. No spam, ever.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="h-12 bg-background/50 border-white/20"
              data-testid="input-newsletter-email"
            />
            <Button
              type="submit"
              size="lg"
              className="glow-purple h-12 px-8"
              disabled={subscribe.isPending}
              data-testid="button-newsletter-subscribe"
            >
              {subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
          {message && (
            <p
              className={`mt-4 text-sm inline-flex items-center gap-2 ${message.kind === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
              data-testid="text-newsletter-message"
            >
              {message.kind === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
