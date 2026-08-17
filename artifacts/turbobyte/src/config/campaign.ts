/**
 * "Operation Tiranga 2026" — Independence Day campaign configuration.
 * Single source of truth for dates, copy, packages, bonuses and FAQ used
 * across /operation-tiranga and the homepage promo surfaces.
 */

export const CAMPAIGN_ID = 'operation-tiranga-2026';
export const CAMPAIGN_ROUTE = '/operation-tiranga';

/** IST start/end instants for the campaign window. */
export const CAMPAIGN_START_DATE = '2026-08-05T00:00:00+05:30';
export const CAMPAIGN_END_DATE = '2026-08-15T23:59:59+05:30';

export function isCampaignActive(now: Date = new Date()): boolean {
  const start = new Date(CAMPAIGN_START_DATE).getTime();
  const end = new Date(CAMPAIGN_END_DATE).getTime();
  return now.getTime() >= start && now.getTime() <= end;
}

export function hasCampaignStarted(now: Date = new Date()): boolean {
  const start = new Date(CAMPAIGN_START_DATE).getTime();
  return now.getTime() >= start;
}

export const campaignCopy = {
  name: 'Operation Tiranga 2026',
  shortBadge: 'Operation Tiranga 2026',
  flagBadge: 'Independence Day Offer',
  headline: 'Your Business Deserves Its Own Independence',
  subheadline:
    'From paperwork and phone tag to a premium website, WhatsApp automation and a system that runs itself — launch before 15 August and start the next chapter of your business online.',
  announcementBar: 'Operation Tiranga Offer Live · Ends 15 August · Claim Offer',
  metaTitle: 'Operation Tiranga 2026 | Independence Day Website Offer | TurboByte Tech Solutions',
  metaDescription:
    'Launch your business online with premium websites starting from ₹4,999. Limited Independence Day Offer till 15 August.',
  endedHeadline: 'Operation Tiranga 2026 Has Concluded',
  endedBody:
    "This Independence Day campaign has ended and its introductory pricing is no longer available. Our standard packages are still built with the same care — reach out and we'll help you plan the right one.",
} as const;

export interface CampaignPackage {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  mostPopular?: boolean;
  tagline: string;
  inclusions: string[];
  deliveryTime: string;
  budgetLabel: string;
}

export const campaignPackages: CampaignPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    priceLabel: '₹4,999',
    tagline: 'A sharp single-page site to get your business online this week.',
    inclusions: [
      '1-page premium website (onepager)',
      'Mobile-responsive design',
      'WhatsApp click-to-chat button',
      'Contact form with email alerts',
      'Basic on-page SEO setup',
      '1 round of design revisions',
    ],
    deliveryTime: '2 days',
    budgetLabel: 'Starter — ₹4,999',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 9999,
    priceLabel: '₹9,999',
    mostPopular: true,
    tagline: 'The complete small-business website — built to convert visitors into enquiries.',
    inclusions: [
      'Up to 5 pages (Home, About, Services, Gallery, Contact)',
      'Everything in Starter',
      'WhatsApp integration on every page',
      'Google Maps location embed',
      'On-page SEO for all pages',
      '2 rounds of design revisions',
    ],
    deliveryTime: '2–3 days',
    budgetLabel: 'Growth — ₹9,999',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 14999,
    priceLabel: '₹14,999',
    tagline: 'A custom-designed site with content and speed built for serious growth.',
    inclusions: [
      'Up to 8 pages with custom design',
      'Everything in Growth',
      'Blog / news section',
      'Advanced SEO structure & sitemap',
      'Speed & performance optimization',
      '3 rounds of design revisions',
    ],
    deliveryTime: '3–5 days',
    budgetLabel: 'Premium — ₹14,999',
  },
  {
    id: 'business-pro',
    name: 'Business Pro',
    price: 24999,
    priceLabel: '₹24,999',
    tagline: 'A growth engine — website plus a CRM that catches every lead.',
    inclusions: [
      'Up to 12 pages, fully custom design',
      'Everything in Premium',
      'CRM lead-capture integration',
      'WhatsApp auto-reply automation',
      'Analytics & search console setup',
      'Priority support during build',
    ],
    deliveryTime: 'Max 5 days',
    budgetLabel: 'Business Pro — ₹24,999',
  },
  {
    id: 'ai-business',
    name: 'AI Business',
    price: 39999,
    priceLabel: '₹39,999+',
    tagline: 'Website, CRM and an AI chatbot that works your front desk 24/7.',
    inclusions: [
      'Everything in Business Pro',
      'AI chatbot trained on your business',
      'WhatsApp Business API automation',
      'Custom workflow automation',
      'Dedicated project manager',
      'Scoped on a free discovery call',
    ],
    deliveryTime: 'Scoped after discovery call',
    budgetLabel: 'AI Business — ₹39,999+',
  },
];

export interface CampaignBonus {
  title: string;
  value: string;
  minTier?: string;
}

export const campaignBonuses: CampaignBonus[] = [
  { title: 'Free domain (1st year)', value: '₹800' },
  { title: 'Business email setup', value: '₹3,000' },
  { title: 'SSL security certificate', value: '₹2,000' },
  { title: 'WhatsApp integration', value: '₹5,000' },
  { title: 'Google Maps business listing', value: '₹2,000' },
  { title: 'AI chatbot (Business Pro & above)', value: '₹15,000', minTier: 'business-pro' },
  { title: '30-day post-launch support', value: '₹5,000' },
  { title: 'Website training session', value: '₹2,500' },
];

export const campaignBonusTotal = '₹35,000+';

export interface ProcessStep {
  title: string;
  description: string;
}

export const campaignProcess: ProcessStep[] = [
  { title: 'Discovery', description: 'A short call to understand your business, customers and goals.' },
  { title: 'Planning', description: 'We map pages, content and features into a clear written scope.' },
  { title: 'Design', description: 'A custom look designed around your brand — not a generic template.' },
  { title: 'Development', description: 'Your site is built, tested on real devices, and connected to WhatsApp.' },
  { title: 'Launch', description: 'We go live on your domain with SSL, SEO basics and tracking in place.' },
  { title: 'Support', description: '30 days of post-launch support plus a walkthrough of how to manage it.' },
];

export interface CampaignFaq {
  question: string;
  answer: string;
}

export const campaignFaqs: CampaignFaq[] = [
  {
    question: 'Is hosting included?',
    answer:
      "Hosting isn't bundled into the package price shown. We help you set up and configure reliable hosting and can recommend affordable annual plans — you stay in control of the account either way.",
  },
  {
    question: 'Can I pay 50% first?',
    answer:
      'Yes. We accept 50% advance to begin work, with the remaining 50% due before final handover and domain go-live.',
  },
  {
    question: 'When does development start?',
    answer:
      'Development begins within 2 business days of confirming your package and receiving the advance payment.',
  },
  {
    question: 'Can I upgrade later?',
    answer:
      "Yes. You can move to a higher package at any point during or after development — we'll simply invoice the difference.",
  },
  {
    question: 'Do you redesign websites?',
    answer:
      'Yes. We redesign and modernise existing websites and migrate your existing content wherever possible.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'UPI, direct bank transfer (NEFT/IMPS), and debit/credit cards via a secure payment link.',
  },
  {
    question: 'Is GST included?',
    answer: 'Prices shown are exclusive of GST. Applicable GST is added to your final invoice.',
  },
];

export const campaignTrustPoints = [
  'Quickest delivery in the market — live in 2–3 days, max 5 for bigger builds',
  'Written scope before any work begins',
  '30-day post-launch support on every package',
  'Bengaluru-based team, not a reseller',
] as const;
