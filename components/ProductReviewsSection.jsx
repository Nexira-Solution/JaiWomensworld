'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function ProductReviewsSection({ product, initialReviews = [] }) {
  const [reviews] = useState(initialReviews);
  const [lightboxImg, setLightboxImg] = useState(null);

  const approvedCount = reviews.length;
  const avgRating =
    approvedCount > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / approvedCount
        ).toFixed(1)
      : null;

  return (
    <section className="mt-16 sm:mt-24 border-t border-[#F5D5DB] pt-12 sm:pt-16">
      {/* Section Header & Rating Summary */}
      <div className="bg-white rounded-2xl border border-[#F5D5DB] p-6 sm:p-8 shadow-card">
        <div className="pb-6 border-b border-[#F5D5DB]">
          <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-1">
            Verified Feedback
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#12233F]">
            Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-[#7B5D69] mt-1 font-light">
            Real opinions and experiences from customers who ordered this item.
          </p>
        </div>

        {/* Rating Breakdown Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
          {approvedCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-center sm:text-left">
                <span className="font-display text-4xl sm:text-5xl font-bold text-[#12233F]">
                  {avgRating}
                </span>
                <span className="text-xs text-[#7B5D69] ml-1">/ 5</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(Number(avgRating))
                          ? 'fill-[#D9A441] text-[#D9A441]'
                          : 'text-[#F5D5DB]'
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-[#7B5D69]">
                  Based on {approvedCount} {approvedCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[#7B5D69]">
              <div className="w-10 h-10 rounded-full bg-[#FFF4F3] border border-[#F5D5DB] flex items-center justify-center text-[#B02F5E] shrink-0">
                <Star size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#12233F]">No ratings yet</p>
                <p className="text-xs text-[#7B5D69]">
                  0 reviews. Be the first to review once your order is delivered!
                </p>
              </div>
            </div>
          )}

          <div className="hidden sm:block h-10 w-px bg-[#F5D5DB]" />

          <div className="flex items-center gap-2 text-xs text-[#7B5D69]">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>Reviews are verified exclusively from delivered customer purchases.</span>
          </div>
        </div>
      </div>

      {/* Approved Reviews Grid (Rendered only when approved reviews exist) */}
      {approvedCount > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => {
              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-xl border border-[#F5D5DB] p-5 sm:p-6 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Review Header: User & Verified Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {r.customerAvatar ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#F5D5DB] shrink-0">
                            <Image
                              src={r.customerAvatar}
                              alt={r.customerName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12233F] to-[#B02F5E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                            {r.customerName?.[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-[#12233F]">
                              {r.customerName}
                            </span>
                            {r.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check size={10} strokeWidth={2.5} /> Verified Buyer
                              </span>
                            )}
                          </div>
                          {dateStr && (
                            <span className="text-[10.5px] text-[#7B5D69] block">{dateStr}</span>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < r.rating
                                ? 'fill-[#D9A441] text-[#D9A441]'
                                : 'text-[#F5D5DB]'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    {r.title && (
                      <h4 className="font-display font-semibold text-sm sm:text-base text-[#12233F]">
                        {r.title}
                      </h4>
                    )}

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-[#7B5D69] leading-relaxed">
                      {r.comment}
                    </p>

                    {/* Customer-Uploaded Images */}
                    {r.images && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {r.images.map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => setLightboxImg(imgUrl)}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#F5D5DB] hover:border-[#B02F5E] transition-all hover:scale-105 active:scale-95 group/thumb"
                            aria-label={`View photo ${imgIdx + 1}`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`Customer photo ${imgIdx + 1}`}
                              fill
                              className="object-cover group-hover/thumb:brightness-95"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox for customer photos */}
      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close photo preview"
            >
              <X size={26} />
            </button>
            <div className="relative w-full h-full max-h-[75vh]">
              <Image
                src={lightboxImg}
                alt="Enlarged review photo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
