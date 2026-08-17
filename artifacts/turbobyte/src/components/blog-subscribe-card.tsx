import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubscribeNewsletter } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Compact subscribe card used at the end of blog articles. */
export function BlogSubscribeCard() {
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
              : "You're subscribed! New posts will land in your inbox.",
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
    <div className="glassmorphism rounded-2xl p-8 border border-white/10">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--app-font-display)' }}>
            Get new posts in your inbox
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Engineering notes and project updates, as they're published. No spam, ever.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="h-11 bg-background/50 border-white/20"
              data-testid="input-article-subscribe-email"
            />
            <Button
              type="submit"
              className="glow-purple h-11 px-6 font-semibold"
              disabled={subscribe.isPending}
              data-testid="button-article-subscribe"
            >
              {subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
          {message && (
            <p
              className={`mt-3 text-sm inline-flex items-center gap-2 ${message.kind === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
              data-testid="text-article-subscribe-message"
            >
              {message.kind === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
