import { SignUp } from '@clerk/react';
import { basePath } from '@/lib/clerk';
import { useSEO } from '@/hooks/use-seo';

export default function SignUpPage() {
  useSEO('Sign Up', 'Create a TurboByte Tech Solutions account.');
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-20">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}
