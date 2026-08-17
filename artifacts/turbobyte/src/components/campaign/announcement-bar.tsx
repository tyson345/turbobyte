import { Link, useLocation } from 'wouter';
import { CAMPAIGN_ROUTE } from '@/config/campaign';
import { useCampaignActive } from '@/hooks/use-campaign-active';

const DEFAULT_PHRASES = [
  '🇮🇳 Operation Tiranga Offer Live',
  'Websites starting from ₹4,999',
  'Ends 15 August',
  'Claim Your Offer →',
];

const CAMPAIGN_PAGE_PHRASES = [
  '🔥 Grab It Now — Limited Time',
  'Over ₹35,000 in launch bonuses',
  'Live in 2–3 days',
  'Only till 15 August',
  '🇮🇳 Independence Day Special',
];

/** Slim scrolling marquee announcement bar shown above the navbar while the campaign is live. */
export function AnnouncementBar() {
  const active = useCampaignActive();
  const [location] = useLocation();
  if (!active) return null;

  const onCampaignPage = location === CAMPAIGN_ROUTE;
  const phrases = onCampaignPage ? CAMPAIGN_PAGE_PHRASES : DEFAULT_PHRASES;

  const sequence = (
    <>
      {phrases.map((phrase, i) => (
        <span key={i} className="inline-flex items-center gap-6 shrink-0">
          <span>{phrase}</span>
          <span aria-hidden="true" className="opacity-60">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <Link
      href={CAMPAIGN_ROUTE}
      className="fixed top-0 left-0 right-0 z-[60] block w-full h-9 overflow-hidden text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#FF9933] via-[#7C3AED] to-[#138808] hover:brightness-110 transition-all"
      data-testid="link-announcement-bar"
      aria-label="Operation Tiranga offer — view details"
    >
      <div className="flex items-center h-full w-max gap-6 animate-marquee whitespace-nowrap px-4">
        {sequence}
        <span aria-hidden="true" className="flex items-center gap-6 shrink-0">
          {phrases.map((phrase, i) => (
            <span key={i} className="inline-flex items-center gap-6 shrink-0">
              <span>{phrase}</span>
              <span className="opacity-60">✦</span>
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
