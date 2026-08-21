import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { useAuth } from '@/lib/auth';
import { basePath } from '@/lib/paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogIn, ShieldAlert } from 'lucide-react';
import logoMark from '@/assets/logo-mark.png';

export default function SignInPage() {
  useSEO('Admin Sign In', 'Sign in to TurboByte Tech Solutions admin panel.', { noindex: true });

  const { signIn, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // If auth is still initialising (checking stored session), show a brief loader.
  if (authLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await signIn(email, password);
      // Redirect to admin leads after successful sign-in.
      setLocation('/admin/leads');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#14101E] p-8 shadow-[0_0_60px_rgba(124,58,237,0.15)]">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <a href={basePath || '/'}>
            <img src={logoMark} alt="TurboByte" className="h-9 w-auto" />
          </a>
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-[#A8A3B8]">
            Access is restricted to authorised TurboByte staff.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#D8D4E6]"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1D1729] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#7C3AED]"
              placeholder="you@turbobytetech.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#D8D4E6]"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1D1729] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#7C3AED]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/5 p-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-[#F4F2FA]">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#A8A3B8]">
          This portal is for authorised admins only.
          <br />
          Account access is managed by invitation.
        </p>
      </div>
    </div>
  );
}
