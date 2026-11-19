'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

export default function BannerCarousel({ banners = [] }) {
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

  // Fallback Editorial Hero when no banners are created in DB yet
  if (!count) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F0E9] via-[#F4E8E3]/60 to-[#F5F0E9] border-b border-[#E9DFD9]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Editorial Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E9DFD9] shadow-xs">
                <Sparkles size={13} className="text-[#BFA078]" />
                <span className="text-[10.5px] uppercase tracking-[0.25em] font-semibold text-[#B98270]">
                  The New Season Collection
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#172333] leading-[1.12] tracking-tight">
                Discover Timeless <span className="italic font-normal text-[#B98270]">Women&rsquo;s Fashion</span> at Jai Womens World
              </h1>

              <p className="text-sm sm:text-base text-[#77716F] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Explore a thoughtfully curated collection of women&rsquo;s boutique wear, featuring beautiful styles
                for everyday elegance, special occasions, and moments worth celebrating.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#172333] hover:bg-[#B98270] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique flex items-center justify-center gap-2 group"
                >
                  <span>Explore The Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/combo"
                  className="w-full sm:w-auto px-8 py-3.5 rounded bg-white hover:bg-[#F4E8E3] text-[#172333] border border-[#E9DFD9] text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center"
                >
                  View Combo Offers
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E9DFD9]/70 flex items-center justify-center lg:justify-start gap-6 text-[11px] text-[#77716F]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BFA078]" />
                  Direct Boutique Quality
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B98270]" />
                  Delivery Across India
                </span>
              </div>
            </div>

            {/* Visual Composition Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden border border-[#E9DFD9] shadow-boutique bg-white">
                <Image
                  src="/Jai-logo.jpeg"
                  alt="Jai Womens World Boutique"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#172333]/80 to-transparent text-white text-center">
                  <span className="font-display text-lg tracking-wider block font-semibold">
                    JAI WOMENS WORLD
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#D8B5A9]">
                    Tiruvannamalai Boutique
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // Active Admin Banner Carousel
  return (
    <section className="relative w-full overflow-hidden bg-[#F5F0E9] border-b border-[#E9DFD9]">
      <div className="relative w-full grid sm:block sm:aspect-[21/9] lg:aspect-[2.8/1] min-h-[220px] sm:min-h-[380px]">
        {banners.map((b, i) => {
          const isActive = i === index;
          const isFirst = i === 0;
          const shouldLoad = isActive || seen.has(i);

          return (
            <Link
              key={b._id}
              href={b.link || '#'}
              className={`col-start-1 row-start-1 block w-full sm:absolute sm:inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              } ${!b.link ? 'cursor-default' : 'cursor-pointer'}`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
            >
              {shouldLoad && (
                <div className="relative w-full h-full">
                  <img
                    src={b.image}
                    alt={b.title || "Jai Womens World Fashion Collection"}
                    loading={isFirst ? 'eager' : 'lazy'}
                    fetchPriority={isFirst ? 'high' : 'auto'}
                    decoding={isFirst ? 'sync' : 'async'}
                    className="block w-full h-auto sm:absolute sm:inset-0 sm:h-full object-cover object-center"
                  />
                  {/* Subtle boutique overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                  {b.title && (
                    <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 z-20 max-w-lg text-white space-y-1">
                      <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#D8B5A9] drop-shadow-sm">
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-[#172333] shadow-md border border-[#E9DFD9] transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-[#172333] shadow-md border border-[#E9DFD9] transition-all z-20"
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
                    background: i === index ? '#BFA078' : 'rgba(255, 255, 255, 0.6)',
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
