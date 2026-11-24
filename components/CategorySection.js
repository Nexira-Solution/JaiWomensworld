'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Petals from '../hero/Petals';
import SilkWaves from '../hero/SilkWaves';

// Fallback curated categories matching the reference showcase image
const CURATED_CATEGORIES = [
  {
    _id: 'cat-sarees',
    name: 'Sarees',
    slug: 'sarees',
    image: '/images/categories/polaroid-sarees.jpg',
    tilt: -4,
    iconType: 'saree',
  },
  {
    _id: 'cat-churidars',
    name: 'Churidars',
    slug: 'salwar-set',
    image: '/images/categories/polaroid-churidars.jpg',
    tilt: 3,
    iconType: 'churidar',
  },
  {
    _id: 'cat-kurtis',
    name: 'Kurtis',
    slug: 'rayon-umbrella-kurtis',
    image: '/images/categories/polaroid-kurtis.jpg',
    tilt: 0,
    iconType: 'kurti',
    isDefaultActive: true,
  },
  {
    _id: 'cat-nighties',
    name: 'Nighties',
    slug: 'nighties',
    image: '/images/categories/polaroid-nighties.jpg',
    tilt: -3,
    iconType: 'nighty',
  },
  {
    _id: 'cat-inners',
    name: 'Inners',
    slug: 'innerwear',
    image: '/images/categories/polaroid-inners.jpg',
    tilt: 4,
    iconType: 'inners',
  },
  {
    _id: 'cat-fragrances',
    name: 'Fragrances',
    slug: 'fragrances',
    image: '/images/categories/polaroid-fragrances.jpg',
    tilt: -2,
    iconType: 'fragrance',
  },
];

// Stylized line icons for each fashion category matching the reference
function CategoryIcon({ type, className = 'w-5 h-5' }) {
  if (type === 'saree') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M4 4C6 8 8 10 12 10C16 10 18 8 20 4" />
        <path d="M5 4L9 21L15 21L19 4" />
        <path d="M9 13C11 15 13 15 15 13" />
        <path d="M8 17C11 19 13 19 16 17" />
      </svg>
    );
  }
  if (type === 'churidar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M7 3L12 6L17 3L18 8L15 10L17 21L7 21L9 10L6 8L7 3Z" />
        <path d="M10 6L12 8L14 6" />
      </svg>
    );
  }
  if (type === 'kurti') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M9 3H15L17 7L15 8L16 21H8L9 8L7 7L9 3Z" />
        <path d="M10 3C10 5 14 5 14 3" />
        <path d="M12 6V11" />
      </svg>
    );
  }
  if (type === 'nighty') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M8 3L10 8L6 21H18L14 8L16 3" />
        <path d="M10 8C12 10 12 10 14 8" />
        <circle cx="12" cy="10" r="1.5" />
      </svg>
    );
  }
  if (type === 'inners') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M4 14C4 10 8 10 9 13C10 16 14 16 15 13C16 10 20 10 20 14C20 18 16 19 12 19C8 19 4 18 4 14Z" />
        <path d="M6 10L7 5M18 10L17 5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="7" y="9" width="10" height="12" rx="2" />
      <path d="M10 9V5C10 4 11 3 12 3C13 3 14 4 14 5V9" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  );
}

// Realistic Wooden Clip Element
function WoodenClip() {
  return (
    <div className="relative z-30 flex flex-col items-center -mb-3 select-none">
      {/* Top Wood peg */}
      <div className="w-3.5 h-6 rounded-t-xs bg-gradient-to-r from-[#D7A87A] via-[#E9C299] to-[#BF8E61] border border-[#A6784D] shadow-xs" />
      {/* Metallic Spring Clip Wire */}
      <div className="w-4 h-1.5 bg-gradient-to-r from-[#AA854C] via-[#E0C18F] to-[#8C6B37] border-y border-[#735427] -my-0.5 rounded-xs z-10 shadow-xs" />
      {/* Lower Wood clamp gripping the card */}
      <div className="w-3.5 h-4 bg-gradient-to-r from-[#BF8E61] via-[#E0B589] to-[#A6784D] border-x border-b border-[#A6784D] rounded-b-xs shadow-sm" />
    </div>
  );
}

function CategorySection({ categories = [] }) {
  // Merge dynamic backend categories with curated fallback assets
  const displayCategories = (categories && categories.length > 0 ? categories : CURATED_CATEGORIES).map((cat, idx) => {
    const curated = CURATED_CATEGORIES[idx % CURATED_CATEGORIES.length];
    return {
      _id: cat._id || `cat-${idx}`,
      name: cat.name || curated.name,
      slug: cat.slug || curated.slug,
      image: cat.image || curated.image,
      tilt: [ -4, 3, 0, -3, 4, -2, 2 ][idx % 7],
      iconType: curated.iconType || 'kurti',
    };
  });

  const [activeIdx, setActiveIdx] = useState(2); // 3rd card ("Kurtis") initially highlighted as in reference
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  // Auto carousel rotation
  useEffect(() => {
    if (isPaused || displayCategories.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayCategories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, displayCategories.length]);

  return (
    <section
      className="relative py-16 sm:py-24 bg-gradient-to-b from-[#F7F3ED] via-[#F8E9E2]/50 to-[#F7F3ED] overflow-hidden border-b border-[#EBD8D5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Shop by Category"
    >
      {/* Atmospheric Background Layers */}
      <Petals />
      <SilkWaves />

      {/* Ambient Bokeh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#D99B99]/15 via-[#C9A46A]/10 to-[#F8E9E2]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          
          {/* Logo silhouette & brand emblem */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 relative">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#142D40]">
                <path
                  d="M16 2C16 2 13 8 13 13C13 16 14.8 18 16 18C17.2 18 19 16 19 13C19 8 16 2 16 2Z"
                  fill="#B83D65"
                />
                <path
                  d="M16 18C13.5 18 8 16 8 11C8 7 12 4 12 4C12 4 10 9 11 12C12 15 16 18 16 18Z"
                  fill="#D99B99"
                />
                <path
                  d="M16 18C18.5 18 24 16 24 11C24 7 20 4 20 4C20 4 22 9 21 12C20 15 16 18 16 18Z"
                  fill="#D99B99"
                />
              </svg>
            </div>
            <span className="font-display text-sm tracking-[0.25em] font-semibold text-[#142D40] uppercase">
              JAI WOMENS WORLD
            </span>
          </div>

          {/* Heading with Dusty Rose Highlight */}
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#142D40] tracking-tight">
            Shop by <span className="text-[#B83D65] italic font-normal">Category</span>
          </h2>

          {/* Decorative Lotus Icon with Horizontal Lines */}
          <div className="flex items-center justify-center gap-3 mt-3.5 mb-2.5">
            <span className="w-10 sm:w-16 h-px bg-[#EBD8D5]" />
            <div className="w-4 h-4 text-[#B83D65]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 9 7 9 12C9 15 10.5 17 12 17C13.5 17 15 15 15 12C15 7 12 2 12 2Z" />
                <path d="M12 17C9.5 17 5 15 5 10C5 6 9 3 9 3C9 3 7 8 8 11C9 14 12 17 12 17Z" opacity="0.6" />
                <path d="M12 17C14.5 17 19 15 19 10C19 6 15 3 15 3C15 3 17 8 16 11C15 14 12 17 12 17Z" opacity="0.6" />
              </svg>
            </div>
            <span className="w-10 sm:w-16 h-px bg-[#EBD8D5]" />
          </div>

          <p className="text-xs sm:text-sm text-[#7A6B69] font-light max-w-md">
            Discover your style from our exclusive collections
          </p>
        </div>

        {/* ── HANGING CLOTHESLINE ROPE & POLAROID SHOWCASE ── */}
        <div className="relative w-full pt-4 pb-12 select-none" ref={containerRef}>
          
          {/* Curved Horizontal Rope / String across the top */}
          <div className="absolute top-8 sm:top-9 inset-x-0 w-full h-8 pointer-events-none z-10 overflow-visible">
            <svg
              viewBox="0 0 1200 40"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xs"
            >
              <path
                d="M-20,10 Q600,32 1220,10"
                stroke="#A8815B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M-20,10 Q600,32 1220,10"
                stroke="#5E4025"
                strokeWidth="1"
                strokeDasharray="4 6"
                strokeLinecap="round"
                className="opacity-70"
              />
            </svg>
          </div>

          {/* Cards Grid / Horizontal Scroll for Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6 pt-6 sm:pt-7 relative z-20">
            {displayCategories.map((c, idx) => {
              const isActive = idx === activeIdx;

              return (
                <div
                  key={c._id}
                  className="relative flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    transform: isActive ? 'scale(1.04) rotate(0deg)' : `rotate(${c.tilt}deg)`,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Wooden Clip */}
                  <WoodenClip />

                  {/* Polaroid Card */}
                  <Link
                    href={`/category/${c.slug}`}
                    className={`relative w-full p-2 sm:p-2.5 pb-3 sm:pb-3.5 bg-white rounded-md transition-all duration-300 flex flex-col ${
                      isActive
                        ? 'border-2 border-[#C9A46A] shadow-[0_0_30px_rgba(201,164,106,0.45)] -translate-y-2'
                        : 'border border-[#EBD8D5]/90 shadow-card hover:border-[#D99B99] hover:shadow-boutique hover:-translate-y-1'
                    }`}
                  >
                    {/* Polaroid Photo Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xs bg-[#F8E9E2]">
                      <img
                        src={c.image}
                        alt={`Jai Womens World ${c.name} Collection`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
                      />

                      {/* Subtle photo gloss sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Polaroid Bottom Label */}
                    <div
                      className={`mt-2.5 py-1.5 px-2 rounded-xs flex items-center justify-between transition-all duration-300 ${
                        isActive
                          ? 'bg-[#142D40] text-[#F7F3ED]'
                          : 'bg-transparent text-[#142D40] group-hover:bg-[#142D40]/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <CategoryIcon
                          type={c.iconType}
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#D99B99]' : 'text-[#B83D65]'
                          }`}
                        />
                        <span className="font-display text-xs sm:text-[13px] font-semibold tracking-wide truncate">
                          {c.name}
                        </span>
                      </div>

                      {/* Animated Arrow on active/hover */}
                      <div
                        className={`transition-all duration-300 transform ${
                          isActive
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                        }`}
                      >
                        <ArrowRight size={13} className={isActive ? 'text-[#C9A46A]' : 'text-[#B83D65]'} />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Indicators */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {displayCategories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  height: '5px',
                  width: i === activeIdx ? '22px' : '6px',
                  backgroundColor: i === activeIdx ? '#142D40' : '#D99B99',
                }}
                aria-label={`Go to category ${i + 1}`}
              />
            ))}
          </div>

        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="mt-4 flex flex-col items-center text-center space-y-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#142D40] hover:bg-[#B83D65] border border-[#C9A46A]/60 text-[#F7F3ED] text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique group hover:scale-105"
          >
            <span>Explore All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#C9A46A]" />
          </Link>

          {/* Bottom Lotus Ornament */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="w-12 h-px bg-[#EBD8D5]" />
            <div className="w-3.5 h-3.5 text-[#B83D65]/70">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 9 7 9 12C9 15 10.5 17 12 17C13.5 17 15 15 15 12C15 7 12 2 12 2Z" />
              </svg>
            </div>
            <span className="w-12 h-px bg-[#EBD8D5]" />
          </div>
        </div>

      </div>
    </section>
  );
}

export default memo(CategorySection);
