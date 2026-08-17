import {
  Bot,
  Workflow,
  Code,
  Clapperboard,
  PenTool,
  Brain,
  type LucideIcon,
} from 'lucide-react';

/**
 * The official TurboByte Tech Solutions service catalog — 19 services
 * grouped into six categories. This is the single source of truth used by
 * the services overview, home page, navbar dropdown, footer links, and the
 * start-project service selector.
 */

export interface ServiceItem {
  name: string;
  desc: string;
  benefits?: string[];
  featured?: boolean;
}

export const contactServiceOptions = [
  "AI Customer-Support Chatbots",
  "AI Voice Agents & Virtual Receptionists",
  "AI Lead-Generation & Sales Assistants",
  "Company Knowledge-Base Assistants",
  "Business Workflow Automation",
  "AI-Powered Website Development",
  "Custom Application Development",
  "Brand Identity & Graphic Design",
  "AI Image Solutions",
  "AI Video & Cinematic Content",
  "Content & Digital Marketing Creatives",
  "Corporate Presentations & Documentation",
  "AI Consulting & Custom Solutions",
];

export const budgetOptions = [
  "₹10,000 – ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000 – ₹10,00,000"
];

export interface ServiceCategory {
  slug: string;
  title: string;
  icon: LucideIcon;
  /** One-line description used on cards and the category page hero. */
  tagline: string;
  /** "What We Do" paragraphs on the category page. */
  intro: string[];
  /** Meta description for SEO. */
  seoDescription: string;
  services: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'ai-agents',
    title: 'AI Agents & Assistants',
    icon: Bot,
    tagline:
      'Intelligent AI agents that talk to your customers, answer questions, and keep your business responsive around the clock.',
    intro: [
      'Modern customers expect instant answers. We design and deploy AI agents that handle real conversations — on your website, over the phone, and inside your business — so every enquiry gets a fast, accurate response.',
      'Every agent is trained on your business: your services, policies, tone of voice, and knowledge. We integrate them with the tools you already use and hand over a system your team can monitor and improve.',
    ],
    seoDescription:
      'AI customer-support chatbots, voice agents, lead-generation assistants, and knowledge-base assistants built by TurboByte Tech Solutions.',
    services: [
      {
        name: 'AI Customer-Support Chatbots',
        desc: 'AI-powered chatbots that answer customer queries 24/7, reduce support costs and improve customer satisfaction.',
        benefits: ['24/7 Support', 'Instant Responses', 'Lead Capture', 'Customer Assistance'],
        featured: true,
      },
      {
        name: 'AI Voice Agents & Virtual Receptionists',
        desc: 'AI-powered voice assistants that answer calls, schedule appointments and handle customer conversations automatically.',
        benefits: ['Call Automation', 'Appointment Booking', 'Voice AI', 'Professional Reception'],
        featured: true,
      },
      {
        name: 'AI Lead-Generation & Sales Assistants',
        desc: 'AI assistants that capture, qualify and nurture leads while improving sales efficiency.',
        benefits: ['Lead Qualification', 'CRM Integration', 'Sales Automation', 'Higher Conversion'],
        featured: true,
      },
      {
        name: 'Company Knowledge-Base Assistants',
        desc: 'Internal AI assistants trained on company documents to help employees find accurate information instantly.',
        benefits: ['Employee Productivity', 'Instant Search', 'Document Intelligence', 'Knowledge Management'],
        featured: true,
      },
    ],
  },
  {
    slug: 'automation',
    title: 'Business Automation',
    icon: Workflow,
    tagline:
      'Workflow automation and real-time dashboards that remove repetitive work and put your key numbers in one place.',
    intro: [
      'Repetitive manual work slows businesses down and introduces errors. We map your workflows, find the steps that can run themselves, and build automation that connects your tools end to end.',
      'Alongside automation, we build business dashboards that consolidate your operations, sales, and finance data into clear, real-time views — so decisions are based on live numbers, not stale spreadsheets.',
    ],
    seoDescription:
      'Business workflow automation and real-time business dashboards from TurboByte Tech Solutions.',
    services: [
      {
        name: 'Business Workflow Automation',
        desc: 'Automate repetitive business processes using AI-powered workflows and intelligent integrations.',
        benefits: ['Reduce Manual Work', 'Increase Productivity', 'Save Time', 'Improve Accuracy'],
        featured: true,
      },
      {
        name: 'Business Dashboards',
        desc: 'Real-time dashboards that bring your key business metrics together in one clear, always-up-to-date view.',
      },
    ],
  },
  {
    slug: 'development',
    title: 'Web, App & SaaS Development',
    icon: Code,
    tagline:
      'Premium websites, custom applications, mobile apps, and SaaS products — engineered to be secure, modern, and scalable.',
    intro: [
      "From a high-converting business website to a full SaaS platform, we build digital products with an AI-first mindset: clean architecture, premium UI/UX, and technology choices that scale with your growth.",
      'We handle the full lifecycle — discovery, design, development, testing, and launch — and deliver software that is fast, secure, and ready for real users from day one.',
    ],
    seoDescription:
      'AI-powered website development, custom applications, web apps, mobile apps, and SaaS product development by TurboByte Tech Solutions.',
    services: [
      {
        name: 'AI-Powered Website Development',
        desc: 'Premium, responsive and SEO-optimized websites enhanced with intelligent AI features.',
        benefits: ['Modern UI', 'Fast Performance', 'SEO Ready', 'Scalable'],
        featured: true,
      },
      {
        name: 'Custom Application Development',
        desc: 'Build secure web applications, mobile apps, SaaS products and enterprise software tailored to business needs.',
        benefits: ['Custom Features', 'Enterprise Quality', 'Scalable Architecture', 'Secure Development'],
        featured: true,
      },
      {
        name: 'Web Application Development',
        desc: 'Fast, secure, and scalable web applications built with modern frameworks and clean architecture.',
      },
      {
        name: 'Mobile App Development',
        desc: 'Polished mobile experiences for iOS and Android, from first MVP to full-scale product.',
      },
      {
        name: 'SaaS Product Development',
        desc: 'End-to-end SaaS development — multi-tenant architecture, subscriptions, onboarding, and everything in between.',
      },
    ],
  },
  {
    slug: 'ai-creative',
    title: 'AI Media & Creative Content',
    icon: Clapperboard,
    tagline:
      'AI-generated images, video, and cinematic content that give your brand premium visuals at startup speed.',
    intro: [
      "AI has changed what's possible in visual content. We combine generative AI tools with professional creative direction to produce imagery and video that look premium — delivered faster and more affordably than traditional production.",
      'From product visuals to cinematic brand films, every asset is refined by hand so the result is polished, on-brand, and ready to publish.',
    ],
    seoDescription:
      'AI image solutions and AI video & cinematic content production by TurboByte Tech Solutions.',
    services: [
      {
        name: 'AI Image Solutions',
        desc: 'AI-generated visuals, product images, image enhancement, restoration and creative assets.',
        benefits: ['Product Visuals', 'Creative Assets', 'Image Enhancement', 'Fast Production'],
        featured: true,
      },
      {
        name: 'AI Video & Cinematic Content',
        desc: 'AI-powered promotional videos, product showcases, social media content and cinematic storytelling.',
        benefits: ['Promotional Videos', 'Product Showcases', 'Social Content', 'Cinematic Storytelling'],
        featured: true,
      },
    ],
  },
  {
    slug: 'branding-design',
    title: 'Branding & Design',
    icon: PenTool,
    tagline:
      'Brand identity, presentations, documentation, and marketing creatives that make your business look as good as it works.',
    intro: [
      'Your brand is how customers remember you. We craft identities and business collateral that communicate professionalism and trust — consistently, across every touchpoint.',
      'From logo and identity systems to investor decks and marketing creatives, we make sure everything your business puts in front of people looks sharp and speaks with one voice.',
    ],
    seoDescription:
      'Brand identity & graphic design, corporate presentations, business documentation, and digital marketing creatives by TurboByte Tech Solutions.',
    services: [
      {
        name: 'Brand Identity & Graphic Design',
        desc: 'Professional branding solutions including logos, marketing materials and corporate identity.',
        benefits: ['Professional Branding', 'Identity Systems', 'Marketing Materials', 'Consistent Look'],
        featured: true,
      },
      {
        name: 'Corporate Presentations & Documentation',
        desc: 'Professional pitch decks, company profiles, proposals, reports and corporate documents.',
        benefits: ['Pitch Decks', 'Company Profiles', 'Professional Reports', 'Business Proposals'],
        featured: true,
      },
      {
        name: 'Content & Digital Marketing Creatives',
        desc: 'Website copy, social media creatives, advertisements and marketing campaigns powered by AI and creativity.',
        benefits: ['Campaign Content', 'Social Creatives', 'Website Copy', 'Ad Visuals'],
        featured: true,
      },
    ],
  },
  {
    slug: 'ai-consulting',
    title: 'AI Consulting & Custom Solutions',
    icon: Brain,
    tagline:
      'Practical AI strategy and bespoke AI systems for businesses that want real results, not experiments.',
    intro: [
      "AI creates the most value when it's applied to the right problem. Our consulting starts with your business — where time is lost, where costs accumulate, where customers wait — and identifies the AI opportunities with real, measurable returns.",
      "When off-the-shelf tools aren't enough, we design and build custom AI solutions around your data, your workflows, and your goals — and support them after launch.",
    ],
    seoDescription:
      'AI consulting and custom AI solutions for businesses, from strategy to production, by TurboByte Tech Solutions.',
    services: [
      {
        name: 'AI Consulting & Custom Solutions',
        desc: 'Strategic AI consulting, business automation planning and custom technology solutions designed around business goals.',
        benefits: ['Strategic Planning', 'Business Automation', 'Tailored Solutions', 'Measurable Returns'],
        featured: true,
      },
    ],
  },
];

/** Flat list of all 19 official service names. */
export const allServiceNames: string[] = serviceCategories.flatMap((c) =>
  c.services.map((s) => s.name),
);

/** URL-safe anchor id for an individual service within its category page. */
export function serviceAnchor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getCategoryBySlug(slug: string): ServiceCategory | undefined {
  return serviceCategories.find((c) => c.slug === slug);
}

/**
 * Legacy service routes from the previous site structure, redirected to
 * the closest official category.
 */
export const legacyServiceRedirects: Record<string, string> = {
  'ai-ml': 'ai-consulting',
  cloud: 'development',
  software: 'development',
  cybersecurity: 'development',
  data: 'automation',
  devops: 'automation',
};
