import { useEffect } from 'react';

export function useSEO(
  title: string,
  description?: string,
  options?: {
    absoluteTitle?: boolean;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    jsonLd?: Record<string, any>;
    noindex?: boolean;
  },
) {
  const absoluteTitle = options?.absoluteTitle ?? false;
  // Options are typically passed as inline object literals; serialize for a stable dep.
  const optionsKey = JSON.stringify(options ?? null);
  useEffect(() => {
    const fullTitle = absoluteTitle || title.includes('TurboByte')
      ? title
      : `${title} | TurboByte Tech Solutions`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const removeMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      document.querySelector(`meta[${attr}="${name}"]`)?.remove();
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    } else {
      removeMeta('og:description', true);
      removeMeta('twitter:description');
    }

    setMeta('og:title', fullTitle, true);
    setMeta('twitter:title', fullTitle);
    setMeta('og:type', options?.ogType ?? 'website', true);

    if (options?.ogImage) {
      setMeta('og:image', options.ogImage, true);
      setMeta('twitter:image', options.ogImage);
      setMeta('twitter:card', 'summary_large_image');
    } else {
      removeMeta('og:image', true);
      removeMeta('twitter:image');
      removeMeta('twitter:card');
    }

    if (options?.noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Canonical always points at the production domain so dev/preview hosts
    // never leak into canonical/og:url values.
    const PROD_ORIGIN = 'https://turbobytetechsolutions.com';
    const canonicalUrl = options?.canonicalUrl ?? PROD_ORIGIN + window.location.pathname;
    setMeta('og:url', canonicalUrl, true);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    const script = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
    if (options?.jsonLd) {
      let el = script;
      if (!el) {
        el = document.createElement('script');
        el.setAttribute('type', 'application/ld+json');
        el.setAttribute('data-seo', 'true');
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(options.jsonLd);
    } else {
      script?.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, absoluteTitle, optionsKey]);
}
