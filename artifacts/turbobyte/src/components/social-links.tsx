import {
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Github,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { socialLinks, type SocialPlatform } from '@/config/site';

const platforms: { key: SocialPlatform; label: string; Icon: LucideIcon }[] = [
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'x', label: 'X (Twitter)', Icon: Twitter },
  { key: 'github', label: 'GitHub', Icon: Github },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
];

interface SocialLinksProps {
  /** 'plain' renders bare icons (footer); 'circle' renders round buttons (contact page). */
  variant?: 'plain' | 'circle';
}

/**
 * Social profile icons. A platform's icon renders only when its URL is
 * configured in `socialLinks` (src/config/site.ts); with no URLs configured
 * nothing renders at all.
 */
export function SocialLinks({ variant = 'plain' }: SocialLinksProps) {
  const active = platforms.filter((p) => socialLinks[p.key]);
  if (active.length === 0) return null;

  return (
    <>
      {active.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={socialLinks[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-testid={`link-social-${key}`}
          className={
            variant === 'circle'
              ? 'w-12 h-12 rounded-full glassmorphism flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all'
              : 'text-muted-foreground hover:text-primary transition-colors'
          }
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </>
  );
}
