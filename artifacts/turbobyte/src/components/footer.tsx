import { Link } from 'wouter';
import { Logo } from './logo';
import { SocialLinks } from './social-links';
import { siteConfig, hasAnySocial } from '@/config/site';
import { serviceCategories } from '@/config/services';
import { AmbientGlow } from './ambient-glow';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/start-project', label: 'Start Your Project' },
];

const resourceLinks = [
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/blog', label: 'Blog' },
  { href: '/careers', label: 'Careers' },
];

const companyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
];

export function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-background border-t border-white/5 relative">
      <AmbientGlow color="mixed" position="bottom-right" className="opacity-20" />
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-[70px] relative z-10">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 xl:grid-cols-[1.7fr_1fr_1.25fr_1fr_1.2fr] xl:gap-12">
          {/* Company Info */}
          <div className="min-w-0 sm:col-span-2 xl:col-span-1">
            <Logo size="footer" className="mb-5 m-0 p-0" />
            <p className="mb-2 font-medium text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              {siteConfig.legalName}
            </p>
            <p className="mb-7 max-w-sm text-base font-light leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>
            {hasAnySocial() && (
              <div className="flex items-center gap-4">
                <SocialLinks />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h4 className="mb-5 font-semibold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              Quick Links
            </h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="min-w-0">
            <h4 className="mb-5 font-semibold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              Services
            </h4>
            <ul className="space-y-3.5">
              {serviceCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="inline-block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-white"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="inline-block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-white">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Company */}
          <div className="min-w-0">
            <h4 className="mb-5 font-semibold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              Resources
            </h4>
            <ul className="space-y-3.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-5 mt-10 font-semibold text-white xl:mt-12" style={{ fontFamily: 'var(--app-font-display)' }}>
              Company
            </h4>
            <ul className="space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="min-w-0">
            <h4 className="mb-5 font-semibold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              Contact
            </h4>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li>
                <a href={siteConfig.emailHref} className="block leading-relaxed transition-colors hover:text-white [overflow-wrap:anywhere]" data-testid="link-footer-email">
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={siteConfig.phoneHref} className="hover:text-white transition-colors" data-testid="link-footer-phone">
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  data-testid="link-footer-whatsapp"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="mt-5 leading-relaxed">
                <a
                  href={siteConfig.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-block"
                  data-testid="link-footer-address"
                >
                  {siteConfig.address.lines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < siteConfig.address.lines.length - 1 && <br />}
                    </span>
                  ))}
                </a>
              </li>
              <li className="pt-1 text-xs font-light text-muted-foreground/70">
                {siteConfig.businessHours.days}
                <br />
                {siteConfig.businessHours.hours}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-center md:mt-16 md:flex-row md:gap-6 md:pt-8 md:text-left">
          <p className="text-xs md:text-sm text-muted-foreground/70 font-light" data-testid="text-copyright">
            © {siteConfig.foundedYear} {siteConfig.legalName}. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <Link href="/privacy" className="text-xs md:text-sm text-muted-foreground/70 hover:text-white transition-colors font-light">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs md:text-sm text-muted-foreground/70 hover:text-white transition-colors font-light">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs md:text-sm text-muted-foreground/70 hover:text-white transition-colors font-light">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}