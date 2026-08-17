import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { siteConfig } from '@/config/site';

export default function Cookies() {
  const seoTitle = 'Cookie Policy | TurboByte Tech Solutions';
  const seoDescription =
    'Learn which cookies and similar technologies the TurboByte Tech Solutions website uses, why we use them, and how you can control them in your browser.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/cookies', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Cookie Policy', path: '/cookies' },
      ]),
    ),
  });

  return (
    <div className="min-h-screen pt-20">
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Cookie Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: August 5, 2026</p>

            <div className="prose prose-invert prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>1. What Are Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website. They help websites remember your
                  preferences and understand how visitors use the site. Similar technologies include local storage and session
                  storage, which serve comparable purposes.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>2. How We Use Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {siteConfig.legalName} uses a minimal set of cookies and browser storage:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong className="text-foreground">Strictly necessary cookies</strong> — required for core functionality such as
                    security, session management, and authentication on admin areas. These cannot be switched off.
                  </li>
                  <li>
                    <strong className="text-foreground">Functional and analytics cookies</strong> — may be used to remember your
                    preferences and to understand how visitors use the site so we can improve performance and user experience, as
                    described in our Privacy Policy.
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We do not currently use third-party advertising or cross-site tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>3. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Some pages load resources from trusted third parties — for example Google Fonts for typography and our
                  authentication provider for secure sign-in. These providers may set their own cookies subject to their own
                  policies.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>4. Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can control or delete cookies through your browser settings. Most browsers let you block all cookies, accept
                  only certain cookies, or delete existing ones. Note that blocking strictly necessary cookies may prevent parts of
                  the website (such as forms or sign-in) from working correctly.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>5. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
                  revision date.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>6. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Cookie Policy, contact us at{' '}
                  <a href={siteConfig.emailHref} className="text-primary hover:underline">
                    {siteConfig.email}
                  </a>{' '}
                  or {siteConfig.phone}.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
