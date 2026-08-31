import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { blogPosts, formatPostDate } from '@workspace/blog';
import { NewsletterSection } from '@/components/newsletter-section';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

export default function Blog() {
  const seoTitle = 'Blog — Engineering Notes & Project Updates';
  const seoDescription =
    'Engineering notes, project updates, and technical insights from the TurboByte Tech Solutions team — published as the work happens.';
  useSEO(seoTitle, seoDescription, {
    jsonLd: schemaGraph(
      webPageSchema({ path: '/blog', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]),
    ),
  });

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
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Engineering notes, project updates, and lessons learned — written as the work
              happens, not after the press release.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Article List */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-6">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <article
                    className="bg-white/[0.015] rounded-[2rem] p-6 sm:p-8 md:p-10 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)] cursor-pointer group relative overflow-hidden"
                    data-testid={`card-blog-${post.slug}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <span className="inline-flex text-xs px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium tracking-wide">
                            {post.category}
                          </span>
                          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-white/40" />
                            {formatPostDate(post.date)}
                          </span>
                          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-white/40" />
                            {post.readTime}
                          </span>
                        </div>
                        <h2
                          className="text-3xl font-medium mb-4 leading-tight group-hover:text-primary transition-colors duration-300 tracking-tight"
                          style={{ fontFamily: 'var(--app-font-display)' }}
                        >
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground font-light leading-relaxed mb-6 md:mb-0 text-lg">{post.summary}</p>
                      </div>

                      <div className="md:self-center shrink-0">
                        <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center transition-all duration-300">
                          <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Insight */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                Behind the Scenes
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Get a transparent look at our development workflows, coding standards, and how we tackle complex business problems with modern AI-first approaches.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <MarketingImage
                src="/images/marketing/developer-workspace.jpg"
                alt="Software engineering workspace"
                aspectRatio="video"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <NewsletterSection />
    </div>
  );
}
