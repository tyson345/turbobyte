import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ScrollToTop } from '@/components/scroll-to-top';
import { BackToTopButton } from '@/components/back-to-top-button';
import { AnnouncementBar } from '@/components/campaign/announcement-bar';
import { CampaignPopup } from '@/components/campaign/campaign-popup';
import logoMark from '@/assets/logo-mark.png';
import { basePath } from '@/lib/paths';
import { AuthProvider } from '@/lib/auth';

const queryClient = new QueryClient();

// Lazy load all pages. Import functions are kept in a list so the same
// modules can be quietly prefetched in the background after first paint —
// this makes navigation instant instead of showing a loader on every click.
const importHome = () => import('@/pages/home');
const importAbout = () => import('@/pages/about');
const importServices = () => import('@/pages/services');
const importServiceCategory = () => import('@/pages/services/[category]');
const importServiceDetail = () => import('@/pages/services/[category]/[service]');
const importSolutions = () => import('@/pages/solutions');
const importCareers = () => import('@/pages/careers');
const importContact = () => import('@/pages/contact');
const importStartProject = () => import('@/pages/start-project');
const importPortfolioDetail = () => import('@/pages/portfolio/[slug]');
const importPortfolio = () => import('@/pages/portfolio');
const importCaseStudies = () => import('@/pages/case-studies');
const importCaseStudyDetail = () => import('@/pages/case-studies/[slug]');
const importBlog = () => import('@/pages/blog');
const importBlogArticle = () => import('@/pages/blog/[slug]');
const importUnsubscribe = () => import('@/pages/unsubscribe');
const importPrivacy = () => import('@/pages/privacy');
const importTerms = () => import('@/pages/terms');
const importCookies = () => import('@/pages/cookies');
const importSignIn = () => import('@/pages/sign-in');
const importNotFound = () => import('@/pages/not-found');
const importServerError = () => import('@/pages/500');
const importDemo = () => import('@/pages/demo');
const importOperationTiranga = () => import('@/pages/operation-tiranga');

const Home = lazy(importHome);
const About = lazy(importAbout);
const Services = lazy(importServices);
const ServiceCategory = lazy(importServiceCategory);
const ServiceDetail = lazy(importServiceDetail);
const Solutions = lazy(importSolutions);
const Careers = lazy(importCareers);
const Contact = lazy(importContact);
const StartProject = lazy(importStartProject);
const PortfolioDetail = lazy(importPortfolioDetail);
const Portfolio = lazy(importPortfolio);
const CaseStudies = lazy(importCaseStudies);
const CaseStudyDetail = lazy(importCaseStudyDetail);
const Blog = lazy(importBlog);
const BlogArticle = lazy(importBlogArticle);
const Unsubscribe = lazy(importUnsubscribe);
const Privacy = lazy(importPrivacy);
const Terms = lazy(importTerms);
const Cookies = lazy(importCookies);
const SignInPage = lazy(importSignIn);
const AdminLeads = lazy(() => import('@/pages/admin/leads'));
const AdminSubscribers = lazy(() => import('@/pages/admin/subscribers'));
const AdminPortfolio = lazy(() => import('@/pages/admin/portfolio'));
const AdminRecruitment = lazy(() => import('@/pages/admin/recruitment'));
const NotFound = lazy(importNotFound);
const ServerError = lazy(importServerError);
const Demo = lazy(importDemo);
const OperationTiranga = lazy(importOperationTiranga);

// Public pages, in rough order of how likely a visitor is to open them next.
// Admin pages are intentionally excluded — most visitors never need them.
const PREFETCH_PAGES = [
  importHome,
  importOperationTiranga,
  importServices,
  importStartProject,
  importContact,
  importAbout,
  importDemo,
  importSolutions,
  importPortfolio,
  importBlog,
  importCareers,
  importCaseStudies,
  importServiceCategory,
  importServiceDetail,
  importPortfolioDetail,
  importBlogArticle,
  importCaseStudyDetail,
  importPrivacy,
  importTerms,
  importCookies,
  importSignIn,
  importUnsubscribe,
  importNotFound,
  importServerError,
];

/** Quietly loads all public pages one at a time after the first page has rendered. */
function usePrefetchPages() {
  useEffect(() => {
    let cancelled = false;
    const queue = [...PREFETCH_PAGES];

    const loadNext = () => {
      if (cancelled) return;
      const next = queue.shift();
      if (!next) return;
      next()
        .catch(() => undefined) // network hiccup — the page will load on demand instead
        .finally(() => {
          if (!cancelled) setTimeout(loadNext, 150);
        });
    };

    // Wait for the first page to settle before starting.
    const timer = setTimeout(loadNext, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}

// Loading component
function PageLoader() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative z-50 w-full">
      <div className="flex flex-col items-center gap-6">
        <img src={logoMark} alt="TurboByte Tech Solutions" className="h-12 w-auto animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function Router() {
  usePrefetchPages();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full relative">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <ScrollToTop />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            
            {/* Services */}
            <Route path="/services" component={Services} />
            <Route path="/services/:category/:service" component={ServiceDetail} />
            <Route path="/services/:category" component={ServiceCategory} />
            
            {/* Solutions */}
            <Route path="/solutions" component={Solutions} />
            
            {/* Portfolio & Case Studies */}
            <Route path="/portfolio/:slug" component={PortfolioDetail} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/case-studies" component={CaseStudies} />
            <Route path="/case-studies/:slug" component={CaseStudyDetail} />

            {/* Blog */}
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogArticle} />

            {/* Careers & Contact */}
            <Route path="/careers" component={Careers} />
            <Route path="/contact" component={Contact} />
            <Route path="/start-project" component={StartProject} />
            
            {/* Demo */}
            <Route path="/demo" component={Demo} />

            {/* Campaigns */}
            <Route path="/operation-tiranga" component={OperationTiranga} />
            
            {/* Newsletter */}
            <Route path="/unsubscribe" component={Unsubscribe} />

            {/* Legal */}
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/cookies" component={Cookies} />
            
            {/* Auth — admin-only sign-in (no public sign-up) */}
            <Route path="/sign-in" component={SignInPage} />

            {/* Admin */}
            <Route path="/admin/leads" component={AdminLeads} />
            <Route path="/admin/subscribers" component={AdminSubscribers} />
            <Route path="/admin/portfolio" component={AdminPortfolio} />
            <Route path="/admin/recruitment" component={AdminRecruitment} />

            {/* Error Pages */}
            <Route path="/500" component={ServerError} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
      <BackToTopButton />
      <CampaignPopup />
    </div>
  );
}

function App() {
  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
