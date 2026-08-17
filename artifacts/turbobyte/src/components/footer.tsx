import { Link } from 'wouter';
import { Logo } from './logo';
import { SocialLinks } from './social-links';
import { siteConfig, hasAnySocial } from '@/config/site';
import { serviceCategories } from '@/config/services';

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
    <footer className="bg-background pt-16 md:pt-24 pb-8 md:pb-12 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10 md:p-12 lg:gap-8 mb-12 md:mb-20">
          {/* Company Info */}
          <div className="col-span-2">
            <Logo variant="full" className="mb-6 -ml-2" />
            <p className="font-medium text-white mb-2" style={{ fontFamily: 'var(--app-font-display)' }}>
              {siteConfig.legalName}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed font-light mb-8 max-w-sm">
              {siteConfig.tagline}
            </p>
            {hasAnySocial() && (
              <div className="flex items-center gap-4">
                <SocialLinks />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-white mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium text-white mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Services
            </h4>
            <ul className="space-y-4">
              {serviceCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Company */}
          <div>
            <h4 className="font-medium text-white mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Resources
            </h4>
            <ul className="space-y-4 mb-10">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-medium text-white mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Company
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-white mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a href={siteConfig.emailHref} className="hover:text-white transition-colors break-all" data-testid="link-footer-email">
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
              <li className="leading-relaxed mt-6">
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
              <li className="pt-2 text-xs font-light text-muted-foreground/70">
                {siteConfig.businessHours.days}
                <br />
                {siteConfig.businessHours.hours}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
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