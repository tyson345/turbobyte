import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WHATSAPP_HREF =
  'https://wa.me/917019793408?text=' +
  encodeURIComponent('Hello TurboByte, I want to claim the Operation Tiranga Independence Day offer.');

/** Sticky bottom CTA bar shown on mobile only, on the campaign landing page. */
export function MobileStickyCta({ onClaim }: { onClaim: () => void }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch gap-2 p-3 border-t border-white/10 bg-background/95 backdrop-blur-lg"
      data-testid="bar-mobile-sticky-cta"
    >
      <Button className="flex-1 glow-purple" onClick={onClaim} data-testid="button-mobile-claim-offer">
        <Sparkles className="mr-1.5 w-4 h-4" /> Claim Offer
      </Button>
      <Button asChild variant="outline" className="border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 px-4">
        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" data-testid="button-mobile-whatsapp">
          <MessageCircle className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}
