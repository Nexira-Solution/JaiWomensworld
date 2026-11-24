'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import Hero from '@/components/home/Hero';

export default function BannerCarousel({ banners = [], watchHref }) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(() => new Set([0]));
  const count = banners?.length || 0;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  useEffect(() => {
    if (!count) return;
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(index);
      next.add((index + 1) % count);
      return next;
    });
  }, [index, count]);

  // No banners created in the admin yet: show the built-in landing hero
  if (!count) return <Hero watchHref={watchHref} />;

  // Active Admin Banner Carousel
  return (
    <section className="relative w-full overflow-hidden bg-[#FFF4F3] border-b border-[#F5D5DB]">
      <div className="relative w-full grid">
        {banners.map((b, i) => {
          const isActive = i === index;
          const isFirst = i === 0;
          const shouldLoad = isActive || seen.has(i);

          return (
            <Link
              key={b._id}
              href={b.link || '#'}
              className={`col-start-1 row-start-1 block w-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              } ${!b.link ? 'cursor-default' : 'cursor-pointer'}`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
            >
              {shouldLoad && (
                <div className="relative w-full">
                  <img
                    src={b.image}
                    alt={b.title || "Jai Womens World Fashion Collection"}
                    loading={isFirst ? 'eager' : 'lazy'}
                    fetchPriority={isFirst ? 'high' : 'auto'}
                    decoding={isFirst ? 'sync' : 'async'}
                    className="block w-full h-auto object-contain object-top"
                  />
                  {/* Subtle boutique overlay for contrast — desktop only */}
                  {b.title && (
                    <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  )}

                  {b.title && (
                    <div className="hidden sm:block absolute bottom-6 sm:bottom-10 left-6 sm:left-12 z-20 max-w-lg text-white space-y-1">
                      <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#F4A7BA] drop-shadow-sm">
                        Featured Collection
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-semibold drop-shadow-md">
                        {b.title}
                      </h2>
                    </div>
                  )}
                </div>
              )}
            </Link>
          );
        })}

        {count > 1 && (
          <>
            {/* Left / Right Nav Arrows */}
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-[#12233F] shadow-md border border-[#F5D5DB] transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-[#12233F] shadow-md border border-[#F5D5DB] transition-all z-20"
              aria-label="Next Slide"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>

            {/* Pagination Dash Indicators */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: '4px',
                    width: i === index ? '24px' : '8px',
                    background: i === index ? '#D9A441' : 'rgba(255, 255, 255, 0.6)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
