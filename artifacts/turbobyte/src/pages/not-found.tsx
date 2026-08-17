import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Home, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedGrid } from '@/components/animated-grid';

export default function NotFound() {
  useSEO('Page Not Found', '404 - The page you are looking for does not exist', { noindex: true });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      <AnimatedGrid />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <Logo variant="full" className="justify-center mb-8" />
          
          <div className="mb-8">
            <h1 className="text-9xl font-bold gradient-text mb-4 animate-float" style={{ fontFamily: 'var(--app-font-display)' }}>
              404
            </h1>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Page Not Found
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="glow-purple" data-testid="button-home">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/20 hover:border-primary" data-testid="button-contact">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
