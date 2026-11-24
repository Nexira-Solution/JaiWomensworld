'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shirt, Sparkles, Moon, Heart, Flower2 } from 'lucide-react';
import { BlossomBranch, SilkWaves, FallingPetals, LotusDivider } from '@/components/Decor';

// Local artwork keyed by what the category name sounds like.
const ARTWORK = [
  { test: /saree|sari/i, src: '/images/categories/sarees.jpg', Icon: Sparkles },
  { test: /churidar|salwar|suit|dress/i, src: '/images/categories/churidars.jpg', Icon: Shirt },
  { test: /kurti|kurta|top|umbrella/i, src: '/images/categories/kurtis.jpg', Icon: Shirt },
  { test: /nighty|night|sleep|lounge/i, src: '/images/categories/nighties.jpg', Icon: Moon },
  { test: /inner|lingerie|bra|panty|combo|2-piece/i, src: '/images/categories/inners.jpg', Icon: Heart },
  { test: /fragrance|perfume|scent/i, src: '/images/categories/fragrances.jpg', Icon: Flower2 },
];
const CYCLE = ARTWORK.map((a) => a.src);

const DEFAULTS = [
  { _id: 'd1', name: 'Sarees', slug: 'sarees' },
  { _id: 'd2', name: 'Churidars', slug: 'churidars' },
  { _id: 'd3', name: 'Kurtis', slug: 'kurtis' },
  { _id: 'd4', name: 'Nighties', slug: 'nighties' },
  { _id: 'd5', name: 'Inners', slug: 'inners' },
  { _id: 'd6', name: 'Fragrances', slug: 'fragrances' },
];

// Where the rope sits (px) for a card at position t (0..1): a gentle sag.
const SAG = 34;
const ropeY = (t) => 4 * SAG * t * (1 - t);

// x-position of an element's left edge inside the scrolling rail
function leftInRail(el, rail) {
  return el.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
}

export default function CategoryShowcase({ categories = [] }) {
  const list = useMemo(() => {
    const base = categories.length ? categories.slice(0, 10) : DEFAULTS;
    return base.map((c, i) => {
      const art = ARTWORK.find((a) => a.test.test(`${c.name} ${c.slug}`));
      return {
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        image: c.image || art?.src || CYCLE[i % CYCLE.length],
        Icon: art?.Icon || Shirt,
        remote: !!c.image && /^https?:/i.test(c.image),
      };
    });
  }, [categories]);

  const n = list.length;
  const [active, setActive] = useState(Math.min(2, n - 1));
  const [paused, setPaused] = useState(false);
  const railRef = useRef(null);
  const itemRefs = useRef([]);
  const ticking = useRef(false);

  // Touch / small screens: highlight whichever card is nearest the centre of the rail.
  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const rail = railRef.current;
      if (!rail) return;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(leftInRail(el, rail) + el.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
    });
  }, []);

  // Desktop: the spotlight drifts across the cards, like the dots in the design.
  useEffect(() => {
    if (paused || n < 2) return;
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!wide || reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % n), 3400);
    return () => clearInterval(t);
  }, [paused, n]);

  function goTo(i) {
    setActive(i);
    const el = itemRefs.current[i];
    const rail = railRef.current;
    if (el && rail && rail.scrollWidth > rail.clientWidth + 4) {
      rail.scrollTo({ left: leftInRail(el, rail) - (rail.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  // Centre the featured card on first paint for narrow screens.
  useEffect(() => {
    const el = itemRefs.current[Math.min(2, n - 1)];
    const rail = railRef.current;
    if (el && rail && rail.scrollWidth > rail.clientWidth + 4) {
      rail.scrollLeft = leftInRail(el, rail) - (rail.clientWidth - el.offsetWidth) / 2;
    }
  }, [n]);

  return (
    <section
      className="relative overflow-hidden pt-14 sm:pt-20 pb-28 sm:pb-36 bg-gradient-to-b from-[#FFE9EC] via-[#FFF1F1] to-[#FFF4F3]"
      aria-labelledby="shop-by-category"
    >
      <BlossomBranch className="w-[120px] sm:w-[300px] lg:w-[400px] opacity-95" />
      <BlossomBranch flip className="w-[120px] sm:w-[300px] lg:w-[400px] opacity-95" />
      <FallingPetals count={8} />

      <div className="relative z-10 text-center px-4">
        <h2
          id="shop-by-category"
          className="font-display font-bold text-[34px] sm:text-5xl lg:text-[56px] leading-[1.05] text-[#12233F]"
        >
          Shop by <span className="text-[#B02F5E]">Category</span>
        </h2>
        <LotusDivider className="mt-3" />
        <p className="mt-3 font-display text-[15px] sm:text-xl text-[#12233F]/85">
          Discover your style from our exclusive collections
        </p>
      </div>

      {/* Clothesline */}
      <div className="relative z-10 mt-10 sm:mt-14">
        <div
          ref={railRef}
          onScroll={onScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="no-scrollbar overflow-x-auto snap-x snap-mandatory scroll-smooth pb-16 pt-6 -mb-6"
        >
          <div className="rope-wrap flex items-start w-max min-w-full lg:w-full">
            <span className="rope-flat" aria-hidden="true" />

            <ul className="relative flex items-start gap-4 sm:gap-6 lg:gap-0 lg:-space-x-3 w-max">
              {/* rope: curve spans exactly the row of cards */}
              <svg
                className="absolute left-0 top-0 h-[60px] w-full pointer-events-none"
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={`M0 4 Q50 ${4 + SAG * 2} 100 4`} fill="none" stroke="#B98A52" strokeWidth="4.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                <path d={`M0 4 Q50 ${4 + SAG * 2} 100 4`} fill="none" stroke="#E6C48E" strokeWidth="4.5" strokeDasharray="2 7" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              </svg>

              {list.map((c, i) => {
                const t = (i + 0.5) / n;
                const drop = ropeY(t);
                const tilt = (t - 0.5) * 11;
                const isActive = i === active;
                return (
                  <li
                    key={c.id}
                    ref={(el) => (itemRefs.current[i] = el)}
                    className={`snap-center shrink-0 relative ${isActive ? 'z-20' : 'z-10'}`}
                    style={{ marginTop: drop }}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <div
                      className="origin-top animate-sway transition-transform duration-500"
                      style={{
                        '--tilt': `${isActive ? 0 : tilt}deg`,
                        animationDelay: `${i * -0.9}s`,
                        animationDuration: `${5.2 + (i % 3)}s`,
                      }}
                    >
                      <Link
                        href={`/category/${c.slug}`}
                        aria-label={`Shop ${c.name}`}
                        className={`group relative block w-[190px] sm:w-[220px] lg:w-[205px] xl:w-[218px] rounded-[10px] bg-white p-2.5 pb-0 transition-all duration-500 ease-out ${
                          isActive
                            ? 'lg:scale-[1.14] -translate-y-1 shadow-[0_0_0_2px_rgba(246,213,115,.9),0_26px_50px_-14px_rgba(176,47,94,.55)]'
                            : 'shadow-[0_14px_30px_-14px_rgba(107,24,56,.4)] hover:-translate-y-1'
                        }`}
                      >
                        {/* clothespin */}
                        <span className="absolute -top-[22px] left-1/2 -translate-x-1/2 z-30 w-[16px] h-[40px] rounded-[3px] bg-gradient-to-b from-[#F0C777] to-[#C38A33] shadow-md" aria-hidden="true">
                          <span className="absolute inset-x-0 top-[17px] h-[2px] bg-[#8B5E1A]/60" />
                        </span>

                        <div className="relative aspect-[4/4.3] overflow-hidden rounded-[4px] bg-[#FCE4E8]">
                          {c.remote ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.image} alt={`${c.name} collection`} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <Image
                              src={c.image}
                              alt={`${c.name} collection`}
                              fill
                              sizes="(max-width:640px) 190px, 220px"
                              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                            />
                          )}
                          {isActive && <span className="shine-sweep absolute inset-0 overflow-hidden" aria-hidden="true" />}
                        </div>

                        <div
                          className={`flex items-center justify-center gap-2 h-[52px] -mx-2.5 rounded-b-[10px] transition-colors duration-500 ${
                            isActive ? 'bg-[#12233F] text-white' : 'bg-white text-[#12233F]'
                          }`}
                        >
                          <c.Icon size={20} strokeWidth={1.5} className={isActive ? 'text-[#F6D573]' : 'text-[#B02F5E]'} />
                          <span className="font-display font-bold text-[17px] sm:text-lg">{c.name}</span>
                          <ArrowRight
                            size={18}
                            className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0'}`}
                          />
                        </div>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <span className="rope-flat" aria-hidden="true" />
          </div>
        </div>

        {/* dots */}
        <div className="flex items-center justify-center gap-2 -mt-1" role="tablist" aria-label="Featured category">
          {list.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={c.name}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-[#12233F]' : 'w-2.5 bg-[#F4A7BA]/70 hover:bg-[#F4A7BA]'}`}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center px-4">
          <Link
            href="/products"
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-[#12233F] px-8 sm:px-10 py-3.5 text-white font-display font-semibold text-base sm:text-lg ring-2 ring-[#F4A7BA]/70 ring-offset-2 ring-offset-[#FFF1F1] shadow-[0_14px_30px_-12px_rgba(18,35,63,.7)] hover:bg-[#6B1838] transition-colors animate-pulse-ring"
          >
            Explore All Categories
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <SilkWaves />
    </section>
  );
}
