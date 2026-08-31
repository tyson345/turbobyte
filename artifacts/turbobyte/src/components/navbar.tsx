import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceCategories } from '@/config/services';
import { useCampaignActive } from '@/hooks/use-campaign-active';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [location] = useLocation();
  const campaignBarActive = useCampaignActive();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location === path;

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        campaignBarActive ? 'top-9' : 'top-0'
      } ${isScrolled ? 'nav-shell-scrolled !rounded-none !border-x-0 !border-t-0 py-2 shadow-sm' : 'bg-transparent py-4'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-8">
            <Link
              href="/"
              className={`nav-link text-sm transition-colors ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`nav-link text-sm transition-colors ${isActive('/about') ? 'nav-link-active' : ''}`}
            >
              About
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="nav-link flex items-center gap-1 text-sm transition-colors">
                Services <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-64 glass-panel-premium rounded-xl shadow-2xl py-2 overflow-hidden"
                  >
                    <Link href="/services" className="nav-dropdown-link block px-5 py-2.5 text-sm transition-colors">
                      All Services
                    </Link>
                    {serviceCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/services/${category.slug}`}
                        className="nav-dropdown-link block px-5 py-2.5 text-sm transition-colors"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button className="nav-link flex items-center gap-1 text-sm transition-colors">
                Solutions <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-56 glass-panel-premium rounded-xl shadow-2xl py-2 overflow-hidden"
                  >
                    <Link href="/solutions" className="nav-dropdown-link block px-5 py-2.5 text-sm transition-colors">
                      All Solutions
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/portfolio"
              className={`nav-link text-sm transition-colors ${isActive('/portfolio') ? 'nav-link-active' : ''}`}
            >
              Portfolio
            </Link>
            <Link
              href="/blog"
              className={`nav-link text-sm transition-colors ${isActive('/blog') ? 'nav-link-active' : ''}`}
            >
              Blog
            </Link>
            <Link
              href="/careers"
              className={`nav-link text-sm transition-colors ${isActive('/careers') ? 'nav-link-active' : ''}`}
            >
              Careers
            </Link>
            <Link
              href="/contact"
              className={`nav-link text-sm transition-colors ${isActive('/contact') ? 'nav-link-active' : ''}`}
            >
              Contact
            </Link>
            <Link
              href="/demo"
              className={`nav-link text-sm transition-colors flex items-center gap-1.5 ${isActive('/demo') ? 'nav-link-active' : ''}`}
            >
              Demo
            </Link>
          </div>

          <div className="hidden xl:block">
            <Link href="/start-project">
              <Button variant="premium" className="rounded-full px-6 font-medium text-sm transition-transform hover:scale-105" data-testid="button-start-project">
                Start Project
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden text-foreground p-2 -mr-2"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-sm glass-panel !rounded-none z-50 xl:hidden overflow-y-auto"
            >
              <div className="p-6 flex flex-col h-full min-h-0">
                <div className="flex justify-end mb-3">
                   <button onClick={() => setMobileMenuOpen(false)} className="text-foreground/80 hover:text-primary p-2 -mr-2" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <Link href="/" className="text-base font-semibold text-foreground hover:text-primary py-1">Home</Link>
                    <Link href="/about" className="text-base font-semibold text-foreground hover:text-primary py-1">About</Link>
                    <Link href="/solutions" className="text-base font-semibold text-foreground hover:text-primary py-1">Solutions</Link>
                    <Link href="/portfolio" className="text-base font-semibold text-foreground hover:text-primary py-1">Portfolio</Link>
                    <Link href="/case-studies" className="text-base font-semibold text-foreground hover:text-primary py-1">Case Studies</Link>
                    <Link href="/blog" className="text-base font-semibold text-foreground hover:text-primary py-1">Blog</Link>
                    <Link href="/careers" className="text-base font-semibold text-foreground hover:text-primary py-1">Careers</Link>
                    <Link href="/contact" className="text-base font-semibold text-foreground hover:text-primary py-1">Contact</Link>
                    <Link href="/demo" className="text-base font-semibold text-foreground hover:text-primary py-1">Demo</Link>
                    <Link href="/services" className="text-base font-semibold text-foreground hover:text-primary py-1">All Services</Link>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-2.5">Services</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {serviceCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/services/${category.slug}`}
                          className="text-sm font-medium text-foreground/85 hover:text-primary py-0.5"
                        >
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] shrink-0">
                  <Link href="/start-project">
                    <Button variant="premium" className="w-full rounded-full h-12 text-base">Start Project</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}