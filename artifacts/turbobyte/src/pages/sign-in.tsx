import { SignIn } from '@clerk/react';
import { basePath } from '@/lib/clerk';
import { useSEO } from '@/hooks/use-seo';

export default function SignInPage() {
  useSEO('Sign In', 'Sign in to TurboByte Tech Solutions.');
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-20">
      {/* path must be the full browser path — Clerk reads window.location.pathname directly */}
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}
