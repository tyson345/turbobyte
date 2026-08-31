import { useSEO } from '@/hooks/use-seo';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedGrid } from '@/components/animated-grid';

export default function ServerError() {
  useSEO('Server Error', '500 - Something went wrong on our end', { noindex: true });

  const handleRetry = () => {
    window.location.reload();
  };

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
            <h1 className="text-9xl font-bold premium-gradient-text mb-4 animate-float" style={{ fontFamily: 'var(--app-font-display)' }}>
              500
            </h1>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Something Went Wrong
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're experiencing technical difficulties. Our team has been notified and is working on a fix.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleRetry} className="glow-purple" data-testid="button-retry">
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/'} className="border-white/20 hover:border-primary" data-testid="button-home">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
