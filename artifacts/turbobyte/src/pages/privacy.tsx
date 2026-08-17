import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { siteConfig } from '@/config/site';

export default function Privacy() {
  const seoTitle = 'Privacy Policy | TurboByte Tech Solutions';
  const seoDescription =
    'Read the TurboByte Tech Solutions Privacy Policy to understand how we collect, use, store, and protect the personal data you share with us.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/privacy', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy' },
      ]),
    ),
  });

  return (
    <div className="min-h-screen pt-20">
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: July 24, 2026</p>

            <div className="prose prose-invert prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TurboByte Tech Solutions Private Limited ("we," "our," or "us") collects information that you provide directly when using our services, including name, email address, company information, phone number, and project details submitted through contact forms or consultation requests.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain technical information when you visit our website, including IP address, browser type, device information, pages visited, and interaction data through cookies and similar technologies.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Respond to inquiries and provide requested services</li>
                  <li>Send project proposals, technical documentation, and service updates</li>
                  <li>Improve our website, services, and customer experience</li>
                  <li>Analyze usage patterns and optimize website performance</li>
                  <li>Comply with legal obligations and enforce our terms of service</li>
                  <li>Send occasional marketing communications (with your consent)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>3. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share data with trusted service providers (hosting, analytics, CRM) who assist in operating our business, under strict confidentiality agreements. We may disclose information when required by law or to protect our rights and safety.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>4. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website uses cookies for analytics, personalization, and functionality. You can control cookie preferences through your browser settings. Disabling cookies may limit certain website features.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>6. Your Rights (GDPR Compliance)</h2>
                <p className="text-muted-foreground leading-relaxed">Under GDPR, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing or request restriction</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, contact us at{' '}
                  <a href={siteConfig.emailHref} className="text-primary hover:underline">{siteConfig.email}</a>.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce agreements. Client project data is retained according to contractual terms.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>8. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed to individuals under 16. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>10. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy periodically. Material changes will be notified via email or prominent website notice. Continued use of our services after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related questions or to exercise your rights, contact:<br /><br />
                  {siteConfig.legalName}<br />
                  <a href={siteConfig.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {siteConfig.address.display}
                  </a><br />
                  Email: <a href={siteConfig.emailHref} className="text-primary hover:underline">{siteConfig.email}</a><br />
                  Phone: <a href={siteConfig.phoneHref} className="text-primary hover:underline">{siteConfig.phone}</a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
