'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shirt, Sparkles, Moon, Heart, Flower2, ChevronLeft, ChevronRight } from 'lucide-react';
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

const TILTS = [-3.5, 2.5, -2, 3, -2.5, 2];

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

  // Triplicate the list for seamless infinite looping (Set 1, Set 2, Set 3)
  const displayList = useMemo(() => {
    if (!list.length) return [];
    return [...list, ...list, ...list].map((item, idx) => ({
      ...item,
      uniqueKey: `${item.id}-${idx}`,
      originalIndex: idx % list.length,
      setIndex: Math.floor(idx / list.length),
    }));
  }, [list]);

  const [active, setActive] = useState(Math.min(2, n - 1));
  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const railRef = useRef(null);
  const itemRefs = useRef([]);
  const ticking = useRef(false);
  const setWidthRef = useRef(0);
  const resumeTimeoutRef = useRef(null);

  // Drag interaction refs
  const isMouseDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Measure pixel width of one complete set of cards
  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail || n === 0) return 0;
    const el0 = itemRefs.current[0];
    const elN = itemRefs.current[n];
    if (el0 && elN) {
      const setW = elN.offsetLeft - el0.offsetLeft;
      setWidthRef.current = setW;
      return setW;
    }
    return 0;
  }, [n]);

  // Center the active card in Set 2 on mount
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || n === 0) return;

    const timer = setTimeout(() => {
      measure();
      const activeEl = itemRefs.current[n + active];
      if (activeEl && rail) {
        rail.scrollLeft = activeEl.offsetLeft - (rail.clientWidth - activeEl.offsetWidth) / 2;
      }
    }, 60);

    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [n, active, measure]);

  // Check accessibility preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Schedule auto-scroll resume after inactivity
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  }, []);

  // Continuous smooth auto-scrolling
  useEffect(() => {
    if (prefersReducedMotion || n < 2) return;

    let animationFrameId;
    let lastTime = null;
    const speed = 36; // 36px per second for comfortable, luxurious boutique viewing

    const step = (time) => {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const rail = railRef.current;
      if (rail && !isInteracting && !isHovered) {
        const singleSetWidth = setWidthRef.current;
        rail.scrollLeft += speed * delta;

        // Seamless wrap: when past Set 2, silently subtract singleSetWidth
        if (singleSetWidth > 0 && rail.scrollLeft >= singleSetWidth * 2) {
          rail.scrollLeft -= singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInteracting, isHovered, prefersReducedMotion, n]);

  // Handle scroll events (tracks center card and seamless loop wrap)
  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    // Silent wrapping check during manual drag or touch swipe
    const singleSetWidth = setWidthRef.current;
    if (singleSetWidth > 0) {
      if (rail.scrollLeft >= singleSetWidth * 2) {
        rail.scrollLeft -= singleSetWidth;
      } else if (rail.scrollLeft < singleSetWidth * 0.5) {
        rail.scrollLeft += singleSetWidth;
      }
    }

    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let bestOriginal = 0;
      let bestDist = Infinity;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestOriginal = idx % n;
        }
      });

      setActive(bestOriginal);
    });
  }, [n]);

  // Manual Desktop Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    dragStartXRef.current = e.pageX;
    dragStartScrollLeftRef.current = rail.scrollLeft;
    setIsInteracting(true);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const rail = railRef.current;
    if (!rail) return;
    const dx = e.pageX - dragStartXRef.current;
    if (Math.abs(dx) > 5) {
      hasMovedRef.current = true;
    }
    rail.scrollLeft = dragStartScrollLeftRef.current - dx;
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
    scheduleResume();
  };

  // Mobile Touch Handlers
  const handleTouchStart = (e) => {
    setIsInteracting(true);
    hasMovedRef.current = false;
    dragStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (Math.abs(e.touches[0].clientX - dragStartXRef.current) > 6) {
      hasMovedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
    scheduleResume();
  };

  // Prevent link navigation if the user was dragging/swiping
  const handleCardClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Navigation Arrows
  const handleNext = () => {
    const rail = railRef.current;
    if (!rail) return;
    setIsInteracting(true);
    const cardWidth = itemRefs.current[0]?.offsetWidth || 220;
    const gap = 24;
    rail.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    scheduleResume();
  };

  const handlePrev = () => {
    const rail = railRef.current;
    if (!rail) return;
    setIsInteracting(true);
    const cardWidth = itemRefs.current[0]?.offsetWidth || 220;
    const gap = 24;
    rail.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    scheduleResume();
  };

  // Pagination Dot Click
  const goTo = (i) => {
    setActive(i);
    setIsInteracting(true);
    const rail = railRef.current;
    const targetEl = itemRefs.current[n + i];
    if (targetEl && rail) {
      const targetLeft = targetEl.offsetLeft - (rail.clientWidth - targetEl.offsetWidth) / 2;
      rail.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
    scheduleResume();
  };

  return (
    <section
      className="relative overflow-hidden pt-8 sm:pt-16 pb-28 sm:pb-36 bg-gradient-to-b from-[#FFE9EC] via-[#FFF1F1] to-[#FFF4F3]"
      aria-labelledby="shop-by-category"
    >
      <BlossomBranch className="w-[120px] sm:w-[300px] lg:w-[400px] opacity-95 pointer-events-none" />
      <BlossomBranch flip className="w-[120px] sm:w-[300px] lg:w-[400px] opacity-95 pointer-events-none" />
      <FallingPetals count={8} />

      {/* Header */}
      <div className="relative z-10 text-center px-4">
        <h2
          id="shop-by-category"
          className="font-display font-bold text-[30px] sm:text-5xl lg:text-[56px] leading-[1.05] text-[#12233F]"
        >
          Shop by <span className="text-[#B02F5E]">Category</span>
        </h2>
        <LotusDivider className="mt-1 sm:mt-3" />
        <p className="mt-1 sm:mt-3 font-display text-[14px] sm:text-xl text-[#12233F]/85">
          Discover your style from our exclusive collections
        </p>
      </div>

      {/* Clothesline Carousel Section */}
      <div className="relative z-10 mt-2 sm:mt-12 group/carousel">
        {/* Left Navigation Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous category"
          className="hidden md:flex absolute left-2 lg:left-6 top-[40%] -translate-y-1/2 z-40 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 hover:bg-white text-[#12233F] hover:text-[#B02F5E] shadow-[0_8px_24px_rgba(107,24,56,0.22)] border border-[#EBD8D5] items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs select-none"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>

        {/* Right Navigation Arrow */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next category"
          className="hidden md:flex absolute right-2 lg:right-6 top-[40%] -translate-y-1/2 z-40 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 hover:bg-white text-[#12233F] hover:text-[#B02F5E] shadow-[0_8px_24px_rgba(107,24,56,0.22)] border border-[#EBD8D5] items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs select-none"
        >
          <ChevronRight size={24} strokeWidth={2.2} />
        </button>

        {/* Scrolling Rail */}
        <div
          ref={railRef}
          onScroll={onScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="no-scrollbar overflow-x-auto select-none pb-12 sm:pb-16 pt-3 sm:pt-6 -mb-4 sm:-mb-6 cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-start w-max px-6 sm:px-12">
            <ul className="relative flex items-start gap-4 sm:gap-6 lg:gap-6 w-max">
              {/* Continuous Clothesline Rope */}
              <div
                className="absolute left-0 right-0 top-[18px] sm:top-[22px] h-[5px] pointer-events-none z-10"
                style={{
                  background: 'repeating-linear-gradient(105deg, #B98A52 0 6px, #E6C48E 6px 11px, #9E6F33 11px 13px)',
                  boxShadow: '0 2px 4px rgba(139,94,26,0.3)',
                }}
                aria-hidden="true"
              />

              {displayList.map((c, i) => {
                const tilt = TILTS[c.originalIndex % TILTS.length];
                const isActive = c.originalIndex === active;

                return (
                  <li
                    key={c.uniqueKey}
                    ref={(el) => (itemRefs.current[i] = el)}
                    className={`shrink-0 relative ${isActive ? 'z-20' : 'z-10'}`}
                    onMouseEnter={() => setActive(c.originalIndex)}
                  >
                    <div
                      className="origin-top animate-sway transition-transform duration-500"
                      style={{
                        '--tilt': `${isActive ? 0 : tilt}deg`,
                        animationDelay: `${(c.originalIndex % 5) * -0.9}s`,
                        animationDuration: `${5.2 + (c.originalIndex % 3)}s`,
                      }}
                    >
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={handleCardClick}
                        aria-label={`Shop ${c.name}`}
                        className={`group relative block w-[190px] sm:w-[220px] lg:w-[220px] xl:w-[230px] rounded-[10px] bg-white p-2.5 pb-0 transition-all duration-500 ease-out select-none ${
                          isActive
                            ? 'scale-[1.08] lg:scale-[1.12] -translate-y-1 shadow-[0_0_0_2px_rgba(246,213,115,.9),0_26px_50px_-14px_rgba(176,47,94,.55)]'
                            : 'shadow-[0_14px_30px_-14px_rgba(107,24,56,.4)] hover:-translate-y-1'
                        }`}
                      >
                        {/* Clothespin */}
                        <span
                          className="absolute -top-[18px] sm:-top-[22px] left-1/2 -translate-x-1/2 z-30 w-[16px] h-[40px] rounded-[3px] bg-gradient-to-b from-[#F0C777] to-[#C38A33] shadow-md pointer-events-none"
                          aria-hidden="true"
                        >
                          <span className="absolute inset-x-0 top-[17px] h-[2px] bg-[#8B5E1A]/60" />
                        </span>

                        {/* Image Container */}
                        <div className="relative aspect-[4/4.3] overflow-hidden rounded-[4px] bg-[#FCE4E8] pointer-events-none">
                          {c.remote ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.image}
                              alt={`${c.name} collection`}
                              loading="lazy"
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                            />
                          ) : (
                            <Image
                              src={c.image}
                              alt={`${c.name} collection`}
                              fill
                              sizes="(max-width:640px) 190px, 220px"
                              className="object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                            />
                          )}
                          {isActive && <span className="shine-sweep absolute inset-0 overflow-hidden" aria-hidden="true" />}
                        </div>

                        {/* Label Bar */}
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
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 -mt-1" role="tablist" aria-label="Featured category">
          {list.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={c.name}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === active ? 'w-6 bg-[#12233F]' : 'w-2.5 bg-[#F4A7BA]/70 hover:bg-[#F4A7BA]'
              }`}
            />
          ))}
        </div>

        {/* Explore Button */}
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
