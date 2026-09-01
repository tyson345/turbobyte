import { useMemo, useState } from 'react';
import { useParams, Redirect, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { absUrl, schemaGraph, breadcrumbSchema, SITE_URL } from '@/lib/schema';
import {
  ArrowRight, ArrowLeft, Building2, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink,
  Target, Lightbulb, Box, ListVideo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetProject, getGetProjectQueryKey, useListProjects } from '@workspace/api-client-react';
import { allServiceNames } from '@/config/services';
import { MarketingImage } from '@/components/marketing-image';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

const kindLabels: Record<string, string> = {
  desktop: 'Desktop View',
  mobile: 'Mobile Experience',
  dashboard: 'Admin Dashboard',
  feature: 'Key Feature',
};

export default function ProjectDetailRoute() {
  const params = useParams<{ slug: string }>();

  const { data: project, isLoading, error } = useGetProject(params.slug, {
    query: {
      enabled: !!params.slug,
      queryKey: getGetProjectQueryKey(params.slug)
    }
  });

  const { data: allProjects = [] } = useListProjects();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const pagePath = `/portfolio/${params.slug}`;

  useSEO(
    project?.seoTitle || (project ? `${project.title} | TurboByte Tech Solutions` : 'Portfolio Project'),
    project?.seoDescription || project?.shortDescription,
    {
      canonicalUrl: absUrl(pagePath),
      ogType: 'article',
              ogImage: project?.thumbnailPath
                ? `/api/storage${project.thumbnailPath}`
                : project?.slug === 'ora-care-dental'
                  ? '/mockups/dental.png'
                  : undefined,
      jsonLd: project
        ? schemaGraph(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Portfolio', path: '/portfolio' },
              { name: project.title, path: pagePath },
            ]),
            {
              '@type': 'CreativeWork',
              name: project.title,
              description: project.shortDescription,
              dateCreated: project.createdAt,
              creator: { '@id': `${SITE_URL}/#organization` },
            },
          )
        : undefined,
    }
  );

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return allProjects
      .filter(p => p.id !== project.id)
      .sort((a, b) => {
        // Same category gets priority
        if (a.category === project.category && b.category !== project.category) return -1;
        if (a.category !== project.category && b.category === project.category) return 1;
        return 0;
      })
      .slice(0, 3);
  }, [allProjects, project]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin motion-reduce:animate-none" />
          <p className="text-muted-foreground text-sm font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  // If error is 404 or unknown project, redirect to portfolio
  if (error || !project) {
    return <Redirect to="/portfolio" replace />;
  }

  const serviceParam = allServiceNames.includes(project.category)
    ? `?services=${encodeURIComponent(project.category)}`
    : '';

  const hasImages = project.images && project.images.length > 0;

  const nextImage = () => setActiveImageIndex((i) => (i + 1) % project.images.length);
  const prevImage = () => setActiveImageIndex((i) => (i - 1 + project.images.length) % project.images.length);

  return (
    <div className="min-h-screen pt-20 pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{project.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-flex text-sm px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-medium">
              {project.category}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
              {project.shortDescription}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {project.clientIndustry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Industry: <strong className="text-foreground font-medium">{project.clientIndustry}</strong></span>
                </div>
              )}
              {project.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Completed: <strong className="text-foreground font-medium">{formatDate(project.completedAt)}</strong></span>
                </div>
              )}
            </div>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex mt-8">
                <Button className="rounded-full px-7">
                  Visit Live Website <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Project Banner Image */}
      {project.thumbnailPath || project.slug === 'ora-care-dental' ? (
        <section className="pb-10 md:pb-16 pt-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[21/9] bg-card"
            >
              <img
                  src={project.thumbnailPath ? `/api/storage${project.thumbnailPath}` : '/mockups/dental.png'}
                alt={`${project.title} banner`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="pb-10 md:pb-16 pt-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MarketingImage
                src="/images/marketing/developer-workspace.jpg"
                alt="Software development process"
                aspectRatio="wide"
                className="shadow-2xl"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Overview & Content */}
      <section className="py-10 md:py-16 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:p-12">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Project Overview</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground prose-p:leading-relaxed">
                  <p>{project.overview}</p>
                </div>
              </div>

              <div className="glassmorphism rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-destructive/80" />
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--app-font-display)' }}>The Challenge</h3>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground prose-p:leading-relaxed">
                  <p>{project.challenge}</p>
                </div>
              </div>

              <div className="glassmorphism rounded-2xl p-8 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--app-font-display)' }}>Our Solution</h3>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground prose-p:leading-relaxed">
                  <p>{project.solution}</p>
                </div>
              </div>

              {project.results && (
                <div>
                  <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>Results & Impact</h3>
                  <div className="glassmorphism rounded-2xl p-8 border border-white/10 bg-white/5">
                    <div className="prose prose-invert max-w-none text-muted-foreground prose-p:leading-relaxed">
                      <p>{project.results}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--app-font-display)' }}>
                  <Box className="w-5 h-5 text-primary" /> Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <span key={tech} className="text-xs px-3 py-1.5 rounded bg-card text-muted-foreground border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.processNotes && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--app-font-display)' }}>
                    <ListVideo className="w-5 h-5 text-primary" /> Development Process
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed">
                    <p>{project.processNotes}</p>
                  </div>
                </div>
              )}

              {project.lessonsLearned && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>Lessons Learned</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed">
                    <p>{project.lessonsLearned}</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                <Link href={`/start-project${serviceParam}`}>
                  <Button className="w-full glow-purple">
                    Request Similar Project <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {hasImages && (
        <section className="py-12 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>Project Gallery</h2>

            <div className="relative glassmorphism rounded-2xl border border-white/10 overflow-hidden bg-card/50">
              <div className="aspect-[16/9] relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={`/api/storage${project.images[activeImageIndex].imagePath}`}
                    alt={project.images[activeImageIndex].altText || `${project.title} screenshot`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-contain p-4 sm:p-6 md:p-12"
                  />
                </AnimatePresence>

                <div className="absolute top-4 left-4">
                  <span className="inline-flex text-xs px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 font-medium">
                    {kindLabels[project.images[activeImageIndex].kind] || project.images[activeImageIndex].kind}
                  </span>
                </div>
              </div>

              {project.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-primary backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-primary backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {project.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === activeImageIndex ? 'bg-primary w-6' : 'bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Gallery thumbnails */}
            {project.images.length > 1 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                {project.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all snap-start ${
                      i === activeImageIndex ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`/api/storage${img.imagePath}`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-12 md:py-24 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ fontFamily: 'var(--app-font-display)' }}>More Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((relProj, i) => (
                <Link key={relProj.id} href={`/portfolio/${relProj.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glassmorphism rounded-xl border border-white/10 hover:border-primary/40 transition-all h-full flex flex-col group overflow-hidden"
                  >
                    <div className="aspect-video relative bg-card overflow-hidden">
                      {relProj.thumbnailPath || relProj.slug === 'ora-care-dental' ? (
                        <img
                          src={relProj.thumbnailPath ? `/api/storage${relProj.thumbnailPath}` : '/mockups/dental.png'}
                          alt={relProj.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                          <Box className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs text-primary mb-2 font-medium">{relProj.category}</span>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--app-font-display)' }}>
                        {relProj.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relProj.shortDescription}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/portfolio">
                <Button variant="outline" className="border-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glassmorphism p-8 md:p-12 rounded-2xl border border-white/10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              We build custom software solutions focused on driving measurable business outcomes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/start-project${serviceParam}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full glow-purple">
                  Start Your Project <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-white/20 hover:bg-white/5">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
