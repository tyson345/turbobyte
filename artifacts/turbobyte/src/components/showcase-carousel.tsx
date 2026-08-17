import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';

const showcases = [
  {
    title: 'Ora-Care Dental',
    category: 'Dental Clinic Website',
    image: '/mockups/dental.png',
  },
  {
    title: 'TurboNest Interiors',
    category: 'Interior Design Website',
    image: '/mockups/interior.png',
  },
  {
    title: 'HR Management System',
    category: 'Custom Business Software',
    image: '/mockups/hrms-admin.png',
  },
  {
    title: 'Lumiere Salon & Spa',
    category: 'Salon Website',
    image: '/mockups/salon.png',
  },
  {
    title: 'ShopBrand',
    category: 'E-commerce Website',
    image: '/mockups/ecommerce.png',
  },
  {
    title: 'TurboGym',
    category: 'Fitness Website',
    image: '/mockups/gym.png',
  },
  {
    title: 'Employee Attendance Portal',
    category: 'Custom Business Software',
    image: '/mockups/hrms-employee.png',
  },
];

export function ShowcaseCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    dragFree: true,
    loop: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full overflow-hidden pb-8 md:pb-12">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex touch-pan-y" style={{ marginLeft: 'calc(50% - 40vw)' }}>
          {showcases.map((item, index) => {
            const isActive = index === selectedIndex;
            return (
              <motion.div
                key={item.title}
                className="embla__slide relative flex-none w-[85vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw] mr-6 md:mr-10 transition-all duration-700 ease-out"
                animate={
                  prefersReducedMotion
                    ? { opacity: isActive ? 1 : 0.5 }
                    : {
                        opacity: isActive ? 1 : 0.5,
                        scale: isActive ? 1 : 0.95,
                        filter: isActive ? 'blur(0px)' : 'blur(2px)',
                      }
                }
              >
                <div
                  className="relative overflow-hidden rounded-2xl bg-card border border-white/5"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
                  tabIndex={0}
                  data-testid={`showcase-card-${index}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-auto block ${prefersReducedMotion ? '' : 'transition-all duration-500'} ${hoveredIndex === index ? 'blur-md scale-[1.03]' : ''}`}
                    loading="lazy"
                  />

                  {/* Text appears only on hover, over the blurred photo */}
                  <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 ${prefersReducedMotion ? '' : 'transition-opacity duration-500'} bg-background/40 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span className="rounded bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-md mb-4">
                      Built by TurboByte
                    </span>
                    <span className="text-white/80 font-medium tracking-widest text-xs uppercase mb-2 block">
                      {item.category}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-medium text-white tracking-tight" style={{ fontFamily: 'var(--app-font-display)' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}