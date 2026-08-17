/**
 * Central site configuration — the single source of truth for company
 * identity, contact details, business hours, and social links.
 *
 * Every component that displays company information must read from this
 * file instead of hard-coding values.
 */

export const siteConfig = {
  name: 'TurboByte Tech Solutions',
  legalName: 'TurboByte Tech Solutions Private Limited',
  tagline: 'Building the Future of Business with Artificial Intelligence.',
  description:
    'TurboByte Tech Solutions Private Limited is an AI-first technology company helping businesses innovate, automate, and grow through intelligent digital solutions.',
  descriptionExtended:
    'We specialize in premium websites, custom software, AI-powered applications, business automation, branding, digital experiences, and scalable technology solutions that solve real business challenges.',
  descriptionFocus:
    'Our focus is on delivering secure, modern, reliable, and future-ready products that combine artificial intelligence, creativity, and engineering excellence.',
  businessType: 'AI-First Technology Company',
  foundedYear: 2026,
  website: 'https://turbobytetechsolutions.com',

  email: 'aae@turbobytetech.com',
  emailHref: 'mailto:aae@turbobytetech.com',

  phone: '+91 7019793408',
  phoneHref: 'tel:+917019793408',
  whatsappHref:
    'https://wa.me/917019793408?text=' +
    encodeURIComponent(
      'Hello TurboByte Tech Solutions, I would like to discuss a website, application or automation project.',
    ),

  address: {
    lines: ['Kudlu Gate', 'Bengaluru', 'Karnataka', 'India'],
    display: 'Kudlu Gate, Bengaluru, Karnataka, India',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Kudlu%20Gate%20Bengaluru%20Karnataka',
  },

  businessHours: {
    days: 'Monday - Friday',
    hours: '11:00 AM – 9:00 PM IST',
  },
  responseTime: 'Within 24 Business Hours',

  mission:
    'To empower businesses with intelligent technology, automation, and AI-driven solutions that improve efficiency, accelerate growth, and create measurable business value.',
  vision:
    "To become one of the world's most respected AI-first technology companies by delivering innovative, reliable, and future-ready digital solutions.",
} as const;

/** The eight official core values. */
export const coreValues = [
  'Innovation',
  'Integrity',
  'Customer Success',
  'Quality',
  'Transparency',
  'Reliability',
  'Continuous Learning',
  'Long-Term Partnerships',
] as const;

/** The official company highlights. */
export const companyHighlights = [
  'AI-First Development',
  'Enterprise Solutions',
  'Business Automation',
  'Scalable Architecture',
  'Premium UI/UX',
  'Modern Technologies',
  'Fast Delivery',
  'Dedicated Support',
  'Secure Development',
] as const;

/** Items shown in the trust card on the contact page. */
export const trustItems = [
  'AI-First Technology Company',
  'Secure Development',
  'Enterprise Quality',
  'Customer Focused',
  'Future Ready Solutions',
] as const;

export interface CompanyStat {
  label: string;
  /**
   * Set a real number to display this counter on the home page.
   * Leave `null` to hide it — we never show made-up numbers. The stats
   * section is hidden entirely while all values are null.
   */
  value: number | null;
  suffix?: string;
}

/** Home-page animated counters. Update values here as real milestones accrue. */
export const companyStats: CompanyStat[] = [
  { label: 'Years of Innovation', value: null, suffix: '+' },
  { label: 'AI Solutions Delivered', value: null, suffix: '+' },
  { label: 'Automation Workflows', value: null, suffix: '+' },
  { label: 'Projects Completed', value: null, suffix: '+' },
  { label: 'Client Satisfaction', value: null, suffix: '%' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/**
 * Client testimonials shown on the home page. Empty by default — a friendly
 * placeholder message is shown until real testimonials are added here.
 */
export const testimonials: Testimonial[] = [];

export type SocialPlatform =
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'github'
  | 'youtube';

/**
 * Social profile URLs. Leave a value empty ('') to hide that platform's
 * icon everywhere on the site — icons only render when a URL is set here.
 */
export const socialLinks: Record<SocialPlatform, string> = {
  linkedin: '',
  instagram: '',
  facebook: '',
  x: '',
  github: '',
  youtube: '',
};

/** True when at least one social profile URL is configured. */
export function hasAnySocial(): boolean {
  return Object.values(socialLinks).some(Boolean);
}
