'use client';

import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, X, ZoomIn, Quote, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export default function ReviewSection({ reviews = [] }) {
  const scrollerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  // Display only real approved reviews from database; never display dummy or hardcoded fake reviews
  const displayReviews = Array.isArray(reviews) ? reviews : [];
  if (displayReviews.length === 0) return null;

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-review-card]')?.offsetWidth || 320;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#FFF4F3] via-[#FCE4E8]/40 to-[#FFF4F3] border-t border-[#F5D5DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Heading */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B02F5E] mb-2">
            Love From Our Customers
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#12233F] tracking-tight">
            Stories That Make Us Smile
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="w-8 h-px bg-[#F5D5DB]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
            <span className="w-8 h-px bg-[#F5D5DB]" />
          </div>
          <p className="text-xs sm:text-sm text-[#7B5D69] font-light max-w-md mt-3">
            Every purchase tells a story. Discover genuine experiences shared by our valued patrons across India.
          </p>

          {/* Desktop Nav Controls */}
          <div className="hidden sm:flex items-center gap-2 mt-6">
            <button
              onClick={() => scrollByAmount(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#F5D5DB] bg-white text-[#12233F] hover:border-[#B02F5E] hover:text-[#B02F5E] transition-colors shadow-xs"
              aria-label="Previous Testimonials"
            >
              <ChevronLeft size={17} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#F5D5DB] bg-white text-[#12233F] hover:border-[#B02F5E] hover:text-[#B02F5E] transition-colors shadow-xs"
              aria-label="Next Testimonials"
            >
              <ChevronRight size={17} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel / Card Grid */}
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 px-1"
        >
          {displayReviews.map((r) => {
            const rating = Math.min(Math.max(r.rating || 5, 1), 5);
            const customerName = r.customer?.name || r.customerName || 'Verified Patron';
            const productName = r.product?.name || r.productName || '';
            const images = r.images || [];

            return (
              <div
                key={r._id}
                data-review-card
                className="shrink-0 w-[290px] sm:w-[350px] snap-start bg-white rounded-lg p-6 border border-[#F5D5DB] shadow-card flex flex-col justify-between hover:border-[#F4A7BA] transition-all"
              >
                <div>
                  {/* Top: Stars + Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rating ? 'text-[#D9A441] fill-[#D9A441]' : 'text-[#F5D5DB]'}
                        />
                      ))}
                    </div>
                    <Quote size={18} className="text-[#F4A7BA]/50" />
                  </div>

                  {/* Title & Comment */}
                  {r.title && (
                    <h3 className="font-display font-medium text-sm sm:text-base text-[#12233F] mb-1.5 leading-snug">
                      &ldquo;{r.title}&rdquo;
                    </h3>
                  )}
                  <p className="text-xs sm:text-[13px] text-[#7B5D69] font-light leading-relaxed line-clamp-4">
                    {r.comment}
                  </p>

                  {/* Product Tag */}
                  {productName && (
                    <span className="inline-block mt-3 text-[10.5px] uppercase tracking-wider text-[#B02F5E] bg-[#FCE4E8] px-2.5 py-0.5 rounded font-medium">
                      {productName}
                    </span>
                  )}

                  {/* Customer Review Photos */}
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-[#F5D5DB]">
                      {images.slice(0, 3).map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightbox(img)}
                          className="relative w-12 h-12 rounded overflow-hidden border border-[#F5D5DB] group cursor-pointer shrink-0"
                          aria-label="Enlarge review photo"
                        >
                          <Image
                            src={img}
                            alt="Customer review photo"
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn size={12} className="text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Customer Name & Verified Badge */}
                <div className="mt-6 pt-4 border-t border-[#F5D5DB] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#12233F] block">{customerName}</span>
                    <span className="text-[10px] text-[#7B5D69] block mt-0.5">
                      {r.city || 'Verified Buyer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10.5px] text-[#B02F5E] font-medium bg-[#FFF4F3] px-2 py-0.5 rounded-full border border-[#F5D5DB]">
                    <CheckCircle size={11} className="text-[#D9A441]" />
                    <span>Verified</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-xl w-full max-h-[85vh] aspect-square rounded-lg overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt="Enlarged review photo"
              fill
              sizes="80vw"
              className="object-contain"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
