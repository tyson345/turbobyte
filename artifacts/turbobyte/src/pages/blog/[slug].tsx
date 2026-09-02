import { motion } from 'framer-motion';
import { Link, useParams } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema, absUrl, SITE_URL } from '@/lib/schema';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPost, formatPostDate } from '@workspace/blog';
import NotFound from '@/pages/not-found';
import { BlogSubscribeCard } from '@/components/blog-subscribe-card';
import { MarketingImage } from '@/components/marketing-image';

// Render markdown-style bold (**text**) and italic (*text*) within a string
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-foreground font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// Render a content block: heading, bullet list, or paragraph
function Block({ block }: { block: string }) {
  if (block.startsWith('## ')) {
    return (
      <h2
        className="text-2xl font-bold mt-12 mb-4 text-foreground"
        style={{ fontFamily: 'var(--app-font-display)' }}
      >
        {block.slice(3)}
      </h2>
    );
  }
  const lines = block.split('\n');
  if (lines.every((l) => l.startsWith('- '))) {
    return (
      <ul className="space-y-3 my-6 list-disc pl-6 marker:text-primary">
        {lines.map((l, i) => (
          <li key={i} className="text-muted-foreground leading-relaxed">
            <RichText text={l.slice(2)} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-muted-foreground leading-relaxed my-6">
      <RichText text={block} />
    </p>
  );
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? '');

  const articlePath = `/blog/${slug ?? ''}`;
  const publisher = {
    '@type': 'Organization',
    name: 'TurboByte Tech Solutions',
    url: SITE_URL,
  };
  useSEO(
    post ? post.title : 'Article Not Found',
    post ? post.summary : 'This article could not be found.',
    post
      ? {
          ogType: 'article',
          jsonLd: schemaGraph(
            webPageSchema({ path: articlePath, title: post.title, description: post.summary }),
            {
              '@type': 'BlogPosting',
              '@id': `${absUrl(articlePath)}#article`,
              headline: post.title,
              description: post.summary,
              datePublished: post.date,
              author: { ...publisher },
              publisher: { ...publisher },
              mainEntityOfPage: { '@id': `${absUrl(articlePath)}#webpage` },
            },
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: articlePath },
            ]),
          ),
        }
      : undefined,
  );

  if (!post) return <NotFound />;

  const blocks = post.content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-3xl">
        <Link href="/blog">
          <button
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-back-to-blog"
          >
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </button>
        </Link>
      </div>

      {/* Header */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-medium">
              {post.category}
            </span>
            <h1
              className="text-3xl sm:text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'var(--app-font-display)' }}
              data-testid="text-article-title"
            >
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-12">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatPostDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>

            <MarketingImage
              src="/images/marketing/software-collaboration.jpg"
              alt="Software engineers collaborating on code"
              aspectRatio="video"
            />
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-10 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </motion.article>
        </div>
      </section>

      {/* Subscribe */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <BlogSubscribeCard />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="bg-white/[0.015] rounded-[2rem] p-8 border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
            <h3
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: 'var(--app-font-display)' }}
            >
              Scoping something similar?
            </h3>
            <p className="text-muted-foreground mb-6">
              Tell us what you're building and we'll give you an honest read on the approach.
            </p>
            <Link href="/start-project">
              <Button className="rounded-full bg-white text-black hover:bg-white/90 px-8 font-medium" data-testid="button-blog-cta">
                Start Your Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
