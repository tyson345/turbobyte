/**
 * JSON-LD structured data helpers.
 * All URLs use the production domain so canonical/schema data is stable
 * regardless of the environment the site is served from.
 */
import { siteConfig, socialLinks } from '@/config/site';

export const SITE_URL = 'https://turbobytetechsolutions.com';

export function absUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

const socials = Object.values(socialLinks).filter(Boolean);

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: SITE_URL,
    logo: absUrl('/favicon-512x512.png'),
    description: siteConfig.description,
    foundingDate: String(siteConfig.foundedYear),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: postalAddressSchema(),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: siteConfig.email,
      telephone: siteConfig.phone,
      availableLanguage: ['English', 'Hindi'],
    },
    ...(socials.length ? { sameAs: socials } : {}),
  };
}

export function postalAddressSchema() {
  return {
    '@type': 'PostalAddress',
    streetAddress: '46 Ground Floor, Novel Tech Park, Hosur Road, Kudlu Gate',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560068',
    addressCountry: 'IN',
  };
}

export function localBusinessSchema() {
  return {
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#localbusiness`,
    name: siteConfig.name,
    image: absUrl('/favicon-512x512.png'),
    url: SITE_URL,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    priceRange: '$$',
    address: postalAddressSchema(),
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
}

export function webSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function webPageSchema(opts: { path: string; title: string; description: string }) {
  return {
    '@type': 'WebPage',
    '@id': `${absUrl(opts.path)}#webpage`,
    url: absUrl(opts.path),
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string }) {
  return {
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: absUrl(opts.path),
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'Worldwide',
    serviceType: opts.name,
  };
}

/** Wrap multiple schema nodes into a single @graph document. */
export function schemaGraph(...nodes: Array<Record<string, unknown>>) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
