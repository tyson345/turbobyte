import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';

// REQUIRED — canonical wiring. Resolves the key from window.location.hostname so
// the same build serves multiple Clerk custom domains.
export const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Empty in dev (intentional), auto-set in prod. Never gate on PROD/NODE_ENV.
export const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
export function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

export const clerkAppearance = {
  theme: dark,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.png`,
  },
  variables: {
    colorPrimary: '#7C3AED',
    colorForeground: '#F4F2FA',
    colorMutedForeground: '#A8A3B8',
    colorDanger: '#F87171',
    colorBackground: '#14101E',
    colorInput: '#1D1729',
    colorInputForeground: '#F4F2FA',
    colorNeutral: '#8B84A3',
    fontFamily: "'Inter', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox:
      'bg-[#14101E] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.15)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: "font-['Space_Grotesk'] text-white",
    headerSubtitle: 'text-[#A8A3B8]',
    socialButtonsBlockButtonText: 'text-white',
    formFieldLabel: 'text-[#D8D4E6]',
    footerActionLink: 'text-[#A78BFA] hover:text-[#C4B5FD]',
    footerActionText: 'text-[#A8A3B8]',
    dividerText: 'text-[#A8A3B8]',
    identityPreviewEditButton: 'text-[#A78BFA]',
    formFieldSuccessText: 'text-[#34D399]',
    alertText: 'text-[#F4F2FA]',
    logoBox: 'justify-center',
    logoImage: 'h-9 w-auto',
    socialButtonsBlockButton:
      'bg-white/5 border border-white/10 hover:bg-white/10',
    formButtonPrimary:
      'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]',
    formFieldInput: 'bg-[#1D1729] border border-white/10 text-white',
    footerAction: 'justify-center',
    dividerLine: 'bg-white/10',
    alert: 'bg-white/5 border border-white/10',
    otpCodeFieldInput: 'bg-[#1D1729] border border-white/10 text-white',
    formFieldRow: 'gap-3',
    main: 'gap-6',
  },
};
