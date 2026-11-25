'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { LotusDivider } from '@/components/Decor';

/**
 * "You may also like" rail: shows up to 4 related products.
 * `items` must already be card-shaped (see lib/cardProduct.js).
 */
export default function RelatedProducts({
  items = [],
  title = 'You May Also Like',
  subtitle = 'Handpicked pieces that go beautifully with this one',
  viewAllHref = '/products',
}) {
  const displayItems = (items || []).slice(0, 4);

  if (!displayItems.length) return null;

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
        <div
          className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 pb-8 pt-2 -mx-1"
        >
          {displayItems.map((p) => (
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
