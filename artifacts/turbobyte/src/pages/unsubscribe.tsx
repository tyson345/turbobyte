import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useUnsubscribeNewsletter } from '@workspace/api-client-react';
import { useSEO } from '@/hooks/use-seo';
import { Loader2, MailX, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function UnsubscribePage() {
  useSEO('Unsubscribe', 'Unsubscribe from TurboByte Tech Solutions blog updates.', { noindex: true });

  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const { mutate, isPending, isIdle, data, error } = useUnsubscribeNewsletter();
  const fired = useRef(false);

  useEffect(() => {
    if (token && !fired.current) {
      fired.current = true;
      mutate({ data: { token } });
    }
  }, [token, mutate]);

  const status = (error as { status?: number } | null)?.status;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-10 text-center"
      >
        {!token && (
          <>
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-400" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid link</h1>
            <p className="text-muted-foreground">
              This unsubscribe link is missing its token. Please use the
              unsubscribe link from one of our emails.
            </p>
          </>
        )}

        {token && (isPending || isIdle) && (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Unsubscribing you…</p>
          </>
        )}

        {data && (
          <>
            <CheckCircle2
              className="mx-auto mb-4 h-10 w-10 text-emerald-400"
              data-testid="icon-unsubscribed"
            />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {data.status === 'already_unsubscribed'
                ? "You're already unsubscribed"
                : "You're unsubscribed"}
            </h1>
            <p className="text-muted-foreground" data-testid="text-unsubscribe-confirmation">
              You won&apos;t receive any more blog updates from TurboByte Tech
              Solutions. Changed your mind? You can re-subscribe anytime from
              the <Link href="/blog" className="text-primary hover:underline">blog</Link>.
            </p>
          </>
        )}

        {error && (
          <>
            <MailX className="mx-auto mb-4 h-10 w-10 text-red-400" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {status === 404 ? 'Link not recognized' : 'Something went wrong'}
            </h1>
            <p className="text-muted-foreground">
              {status === 404
                ? "We couldn't find a subscription for this link. It may have already been removed."
                : "We couldn't process your request. Please try again in a moment."}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
