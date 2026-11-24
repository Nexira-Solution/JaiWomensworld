'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { LotusDivider } from '@/components/Decor';

/**
 * "You may also like" rail: swipeable on phones, arrow buttons on desktop.
 * `items` must already be card-shaped (see lib/cardProduct.js).
 */
export default function RelatedProducts({
  items = [],
  title = 'You May Also Like',
  subtitle = 'Handpicked pieces that go beautifully with this one',
  viewAllHref = '/products',
}) {
  const railRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, items.length]);

  function scrollBy(dir) {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = (card?.offsetWidth || 260) + 20;
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }

  if (!items.length) return null;

  return (
    <section className="relative mt-16 sm:mt-24" aria-labelledby="related-title">
      <Reveal className="text-center">
        <h2 id="related-title" className="font-display font-bold text-3xl sm:text-4xl text-[#12233F]">
          {title}
        </h2>
        <LotusDivider className="mt-3" />
        <p className="mt-2.5 text-sm sm:text-base text-[#7B5D69] max-w-md mx-auto">{subtitle}</p>
      </Reveal>

      <div className="relative mt-10">
        {/* desktop arrows */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="Previous products"
          className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white text-[#12233F] shadow-lg border border-[#F5D5DB] transition hover:bg-[#B02F5E] hover:text-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="Next products"
          className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white text-[#12233F] shadow-lg border border-[#F5D5DB] transition hover:bg-[#B02F5E] hover:text-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight size={22} />
        </button>

        <div
          ref={railRef}
          onScroll={update}
          className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 pb-8 pt-2 -mx-1"
        >
          {items.map((p) => (
            <div
              key={p._id}
              data-card
              className="snap-start shrink-0 basis-[calc(50%-8px)] sm:basis-[calc(33.333%-16px)] lg:basis-[calc(25%-18px)]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#6B1838] px-7 py-3 font-semibold text-[#6B1838] transition-colors hover:bg-[#6B1838] hover:text-white"
        >
          View all products
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
