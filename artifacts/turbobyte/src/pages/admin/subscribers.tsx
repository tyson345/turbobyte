import { useAuth } from '@/lib/auth';
import { Redirect, Link } from 'wouter';
import { useListNewsletterSubscribers } from '@workspace/api-client-react';
import { useSEO } from '@/hooks/use-seo';
import { Loader2, Mail, Calendar, ShieldAlert, LogOut, Rocket, MessageSquare } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function SubscribersContent() {
  const { data, isLoading, error } = useListNewsletterSubscribers();
  const { signOut, user } = useAuth();

  const status = (error as { status?: number } | null)?.status;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16 sm:px-6">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Newsletter Subscribers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Everyone who signed up for blog updates, newest first.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/portfolio">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-portfolio"
            >
              <Rocket className="h-4 w-4" /> Portfolio
            </button>
          </Link>
          <Link href="/admin/leads">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-leads"
            >
              <MessageSquare className="h-4 w-4" /> Leads
            </button>
          </Link>
          <Link href="/admin/recruitment">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-recruitment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2 h-4 w-4"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg> Recruitment
            </button>
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-12 md:py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {status === 403 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <p className="text-foreground font-medium">
            This account isn&apos;t authorized to view subscribers.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user?.email}. Only
            company admin accounts can access this page.
          </p>
        </div>
      )}

      {error && status !== 403 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-foreground">
          Couldn&apos;t load subscribers. Please try again.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-12 text-center text-muted-foreground">
          No subscribers yet. Sign-ups from the blog subscribe form will appear
          here.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground" data-testid="text-subscriber-count">
            {data.length} {data.length === 1 ? 'subscriber' : 'subscribers'}
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
            {data.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4"
                data-testid={`row-subscriber-${s.id}`}
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={`mailto:${s.email}`}
                    className={`flex items-center gap-2 text-sm hover:underline break-all ${
                      s.unsubscribedAt ? 'text-muted-foreground line-through' : 'text-primary'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {s.email}
                  </a>
                </div>
                <span className="flex items-center gap-3">
                  {s.unsubscribedAt && (
                    <span
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-300"
                      data-testid={`badge-unsubscribed-${s.id}`}
                      title={`Unsubscribed ${formatDate(s.unsubscribedAt)}`}
                    >
                      Unsubscribed
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(s.createdAt)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSubscribersPage() {
  useSEO('Admin — Subscribers', 'Private subscriber list for TurboByte Tech Solutions.', { noindex: true });
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/sign-in" />;
  }

  return <SubscribersContent />;
}
