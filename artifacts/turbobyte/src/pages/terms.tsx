import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { siteConfig } from '@/config/site';

export default function Terms() {
  const seoTitle = 'Terms of Service | TurboByte Tech Solutions';
  const seoDescription =
    'Review the TurboByte Tech Solutions Terms of Service — the legal terms that govern how you access and use our website, services, and related offerings.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/terms', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Terms of Service', path: '/terms' },
      ]),
    ),
  });

  return (
    <div className="min-h-screen pt-20">
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Terms of Service</h1>
            <p className="text-muted-foreground mb-12">Last updated: July 24, 2026</p>

            <div className="prose prose-invert prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the services provided by TurboByte Tech Solutions Private Limited ("Company," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>2. Services Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TurboByte provides AI-first technology services including AI agents and assistants, business automation, web and mobile application development, SaaS product development, AI media and creative content, branding and design, and AI consulting and custom AI solutions. Specific services, deliverables, timelines, and pricing are defined in individual Statements of Work (SOW) or service agreements.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>3. Client Obligations</h2>
                <p className="text-muted-foreground leading-relaxed">Clients agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate information and timely access to necessary resources</li>
                  <li>Designate authorized representatives for decision-making</li>
                  <li>Review and provide feedback on deliverables within agreed timeframes</li>
                  <li>Make timely payments according to the agreed payment schedule</li>
                  <li>Maintain confidentiality of proprietary information shared by TurboByte</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>4. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Payment terms are specified in individual SOWs. Standard terms include 50% upfront and 50% upon completion, or milestone-based payments. Invoices are due within 30 days of issuance. Late payments incur a 1.5% monthly interest charge. We reserve the right to suspend services for overdue accounts exceeding 60 days.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>5. Intellectual Property Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Client IP:</strong> Clients retain ownership of their pre-existing intellectual property and data provided to TurboByte.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Deliverables:</strong> Upon full payment, clients receive ownership of custom-developed deliverables specified in the SOW, excluding TurboByte's pre-existing tools, frameworks, and methodologies.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>TurboByte IP:</strong> We retain ownership of our proprietary tools, frameworks, code libraries, and methodologies used in delivering services.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>6. Confidentiality</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Both parties agree to maintain confidentiality of proprietary information disclosed during the engagement. Confidential information excludes publicly available data or information independently developed. Confidentiality obligations survive termination for five years.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>7. Warranties and Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TurboByte warrants that services will be performed in a professional and workmanlike manner consistent with industry standards. We do not warrant that deliverables will be error-free or meet all client requirements not explicitly specified in the SOW.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  <strong>EXCEPT AS EXPRESSLY PROVIDED, SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TurboByte's total liability for any claim arising from services shall not exceed the amount paid by the client for the specific project or $50,000, whichever is less. We are not liable for indirect, incidental, consequential, or punitive damages, including lost profits, data loss, or business interruption.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>9. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Either party may terminate an engagement with 30 days written notice. Upon termination, the client pays for work completed to date. TurboByte may immediately terminate for non-payment or material breach. Confidentiality and IP provisions survive termination.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>10. Governing Law and Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws of India. Disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in Bengaluru, India under the Indian Arbitration and Conciliation Act, 1996.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>11. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. Material changes will be communicated via email. Continued use of services after changes constitutes acceptance. Existing SOWs remain governed by Terms in effect when signed.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>12. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions regarding these Terms, contact:<br /><br />
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
