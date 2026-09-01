import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearch } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { ArrowRight, Image as ImageIcon, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useListProjects,
  useListProjectCategories,
  useListCaseStudies
} from '@workspace/api-client-react';
import { allServiceNames } from '@/config/services';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default function Portfolio() {
  const seoTitle = 'Portfolio — Websites & Software Built by TurboByte';
  const seoDescription =
    'See websites, e-commerce stores, business software, and AI automation built by TurboByte — a website design and development company in Bengaluru, India.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/portfolio', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Portfolio', path: '/portfolio' },
      ]),
    ),
  });

  const [location, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const activeCategory = params.get('category') || 'All';

  const projectsRef = useRef<HTMLElement>(null);

  const { data: projects = [], isLoading: isLoadingProjects } = useListProjects();
  const { data: categories = [] } = useListProjectCategories();
  const { data: caseStudies = [], isLoading: isLoadingCaseStudies } = useListCaseStudies();

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(params);
    if (cat === 'All') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    const qs = next.toString();
    navigate(qs ? `${location}?${qs}` : location, { replace: true });
  };

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <AmbientHero />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 premium-gradient-text"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              Our Work & Success Stories
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              Explore selected projects and business solutions that demonstrate our expertise in AI, software development, automation, branding, and digital transformation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="glow-purple w-full sm:w-auto" onClick={scrollToProjects}>
                View Projects <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Link href="/start-project" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-white/20 w-full">
                  Start Your Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-white/[0.015] border border-white/5 rounded-[2.5rem] p-8 sm:p-6 md:p-12 shadow-[0_0_50px_-10px_rgba(124,58,237,0.1)]">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Building Solutions That Deliver Real Business Value
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Every project at TurboByte Tech Solutions is built with a focus on innovation, quality, scalability, and long-term business impact. Our portfolio highlights the types of solutions we create and serves as a showcase for completed work as it becomes available.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section ref={projectsRef} className="py-10 md:py-16 bg-card/30 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center mb-12">
            <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--app-font-display)' }}>
              Selected Projects
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
              <button
                onClick={() => setCategory('All')}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-white/10 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                    activeCategory === cat.name
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-white/10 hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white/[0.015] rounded-[2rem] overflow-hidden border border-white/5 animate-pulse motion-reduce:animate-none h-96" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white/[0.015] rounded-[2.5rem] border border-white/5">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Projects will be showcased here as they are published.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white/[0.015] rounded-[2.5rem] border border-white/5">
              <p className="text-lg text-muted-foreground">
                No projects found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, i) => {
                const serviceParam = allServiceNames.includes(project.category)
                  ? `?services=${encodeURIComponent(project.category)}`
                  : '';

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/[0.015] rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 flex flex-col group hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)] relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <Link href={`/portfolio/${project.slug}`} className="block relative aspect-[4/3] bg-card overflow-hidden">
                      {project.thumbnailPath || project.slug === 'ora-care-dental' ? (
                        <img
                          src={project.thumbnailPath ? `/api/storage${project.thumbnailPath}` : '/mockups/dental.png'}
                          alt={project.title}
                          loading="lazy"
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <span className="inline-flex text-xs px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 font-medium">
                          {project.category}
                        </span>
                        {project.completedAt && (
                          <span className="text-xs text-white/80 font-medium drop-shadow-md bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {formatDate(project.completedAt)}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-8 flex flex-col flex-1 relative z-10">
                      <Link href={`/portfolio/${project.slug}`} className="hover:text-primary transition-colors">
                        <h4 className="text-2xl font-medium mb-3 tracking-tight group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--app-font-display)' }}>
                          {project.title}
                        </h4>
                      </Link>

                      <p className="text-muted-foreground font-light leading-relaxed line-clamp-3 mb-6 flex-1">
                        {project.shortDescription}
                      </p>

                      {project.techStack && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {project.techStack.slice(0, 4).map(tech => (
                            <span key={tech} className="text-[11px] px-2.5 py-1 rounded bg-white/5 text-white/70 border border-white/5">
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="text-[11px] px-2.5 py-1 rounded bg-white/5 text-white/70 border border-white/5">
                              +{project.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-white/10">
                        <Link href={`/portfolio/${project.slug}`} className="flex-1">
                          <Button variant="ghost" className="w-full rounded-full border border-white/10 hover:bg-white/5 font-medium group/btn">
                            View Details <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                          </Button>
                        </Link>
                        <Link href={`/start-project${serviceParam}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-full bg-white text-black hover:bg-white/90 border-transparent font-medium">
                            Request Similar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-12 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              In-Depth <span className="premium-gradient-text">Case Studies</span>
            </h2>
            <p className="text-muted-foreground">
              Beyond the portfolio, we document select engagements with verified outcomes, architectures, and lessons learned.
            </p>
          </div>

          {isLoadingCaseStudies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white/[0.015] rounded-[2rem] p-8 border border-white/5 animate-pulse motion-reduce:animate-none h-48" />
              ))}
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="bg-white/[0.015] rounded-[2.5rem] border border-white/5 p-6 md:p-12 text-center">
              <p className="text-lg font-medium text-foreground">
                Detailed case studies will be published as we complete more client engagements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudies.map((cs) => (
                <Link key={cs.slug} href={`/case-studies/${cs.slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white/[0.015] rounded-[2rem] p-6 sm:p-8 md:p-10 border border-white/5 hover:border-primary/40 transition-all duration-500 h-full flex flex-col cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-8">
                        <span className="text-xs px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium tracking-wide">
                          {cs.category}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:-rotate-45 transition-all duration-300" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-medium mb-4 tracking-tight group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'var(--app-font-display)' }}>
                        {cs.title}
                      </h3>
                      <p className="text-muted-foreground font-light leading-relaxed line-clamp-3 mb-8 flex-1">
                        {cs.summary}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                        <div>
                          <p className="text-3xl font-medium text-white mb-1" style={{ fontFamily: 'var(--app-font-display)' }}>{cs.metricValue}</p>
                          <p className="text-xs tracking-widest uppercase text-white/40 font-semibold">{cs.metricLabel}</p>
                        </div>
                        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm font-medium text-primary">Read case study</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--app-font-display)' }}
              >
                Have a Similar Project in Mind?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Let's discuss your requirements and build a custom solution tailored to your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/start-project" className="w-full sm:w-auto">
                  <Button size="lg" className="glow-purple w-full">
                    Start Your Project <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-white/20">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <MarketingImage
                src="/images/marketing/digital-strategy.jpg"
                alt="Project planning session"
                aspectRatio="video"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
