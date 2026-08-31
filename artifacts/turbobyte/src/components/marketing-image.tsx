import { HTMLAttributes, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { basePath } from '@/lib/paths';

interface MarketingImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill';
  imageClassName?: string;
  caption?: string;
}

export function MarketingImage({
  src,
  alt,
  width,
  height,
  priority = false,
  aspectRatio = 'auto',
  objectFit = 'cover',
  className,
  imageClassName,
  caption,
  ...props
}: MarketingImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "200px 0px" });
  const resolvedSrc = src.startsWith('/') ? `${basePath}${src}` : src;

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
    auto: 'aspect-auto'
  }[aspectRatio];

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  }[objectFit];

  return (
    <div ref={ref} className={cn('relative flex flex-col group', className)} {...props}>
      <div className={cn('relative w-full overflow-hidden rounded-2xl bg-muted/20 border border-white/5', aspectRatioClass)}>
        {(priority || isInView) && (
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            src={resolvedSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'auto' : 'async'}
            className={cn('w-full h-full text-transparent', objectFitClass, imageClassName)}
          />
        )}
        {/* Subtle overlay to ensure it blends with dark theme */}
        <div className="absolute inset-0 bg-background/10 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
      </div>
      {caption && (
        <p className="mt-3 text-sm text-muted-foreground font-light text-center">
          {caption}
        </p>
      )}
    </div>
  );
}
