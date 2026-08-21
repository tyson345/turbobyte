import { useSEO } from '@/hooks/use-seo';
import { basePath } from '@/lib/paths';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'wouter';
import logoMark from '@/assets/logo-mark.png';

/**
 * Sign-up is disabled for public users.
 * Admin accounts are created by invitation only via the Supabase dashboard.
 */
export default function SignUpPage() {
  useSEO('Sign Up — Admin Invitation Only', 'Account registration is by invitation only.', { noindex: true });

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#14101E] p-8 text-center shadow-[0_0_60px_rgba(124,58,237,0.15)]">
        <div className="mb-6 flex justify-center">
          <a href={basePath || '/'}>
            <img src={logoMark} alt="TurboByte" className="h-9 w-auto" />
          </a>
        </div>

        <div className="flex justify-center mb-5">
          <ShieldAlert className="h-12 w-12 text-amber-400" />
        </div>

        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">
          Invitation Only
        </h1>
        <p className="text-sm text-[#A8A3B8] mb-6">
          Account registration is restricted to authorised TurboByte staff.
          New admin accounts are created by invitation through the Supabase
          dashboard — there is no public sign-up.
        </p>

        <Link href="/sign-in">
          <a className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2.5 text-sm font-medium shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-colors">
            Go to Sign In
          </a>
        </Link>
      </div>
    </div>
  );
}
