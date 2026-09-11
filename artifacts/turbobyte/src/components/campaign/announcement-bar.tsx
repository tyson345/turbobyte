const PHRASES = [
  'Coming Soon: ByteCare Elite',
  'A premium vertical of TurboByte',
  'Premium device care in Bengaluru',
  'Secure pickup',
  'Transparent diagnosis',
  'Documented parts',
  '25-point quality control',
  'Discover ByteCare Elite →',
];

/** Slim scrolling marquee introducing TurboByte's upcoming premium vertical. */
export function AnnouncementBar() {
  const sequence = (
    <>
      {PHRASES.map((phrase, i) => (
        <span key={i} className="inline-flex items-center gap-6 shrink-0">
          <span>{phrase}</span>
          <span aria-hidden="true" className="text-violet-200/80">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <a
      href="https://www.bytecareelite.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 left-0 right-0 z-[60] block w-full h-10 overflow-hidden text-xs sm:text-sm font-semibold tracking-wide !text-white bg-gradient-to-r from-[#3b146f] via-[#7c3aed] to-[#4c1d95] hover:brightness-110 transition-all"
      data-testid="link-announcement-bar"
      aria-label="Coming soon: ByteCare Elite, a premium vertical of TurboByte"
    >
      <div className="flex items-center h-full w-max gap-6 animate-marquee whitespace-nowrap px-4">
        {sequence}
        <span aria-hidden="true" className="flex items-center gap-6 shrink-0">
          {PHRASES.map((phrase, i) => (
            <span key={i} className="inline-flex items-center gap-6 shrink-0">
              <span>{phrase}</span>
              <span className="text-violet-200/80">✦</span>
            </span>
          ))}
        </span>
      </div>
    </a>
  );
}
