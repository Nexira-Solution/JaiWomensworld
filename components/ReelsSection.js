'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Sparkles, ArrowRight } from 'lucide-react';

const isDirectVideoUrl = (url) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url || '');

function ReelMedia({ reel }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const canPlay = isDirectVideoUrl(reel.videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [canPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (shouldLoad && isVisible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldLoad, isVisible]);

  if (canPlay) {
    return (
      <video
        ref={videoRef}
        src={shouldLoad ? reel.videoUrl : undefined}
        poster={reel.thumbnail || undefined}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <Image
      src={reel.thumbnail || '/placeholder.png'}
      alt={reel.title || 'Fashion Reel'}
      fill
      sizes="(max-width: 640px) 160px, 200px"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function ReelsSection({ reels }) {
  if (!reels?.length) return null;

  return (
    <section className="py-20 bg-[#F5F0E9] border-t border-[#E9DFD9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B98270] block mb-2">
            Fashion In Motion
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#172333]">
            Shop By Video
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="w-8 h-px bg-[#E9DFD9]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#BFA078]" />
            <span className="w-8 h-px bg-[#E9DFD9]" />
          </div>
          <p className="text-xs sm:text-sm text-[#77716F] font-light max-w-md mx-auto mt-3">
            See our latest boutique arrivals draped, styled, and brought to life in high definition.
          </p>
        </div>

        {/* Reels Horizontal Row */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1">
          {reels.map((reel) => {
            const hasVideo = isDirectVideoUrl(reel.videoUrl);
            return (
              <div
                key={reel._id}
                className="min-w-[160px] sm:min-w-[200px] shrink-0 snap-start group"
              >
                {/* Portrait Card */}
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden border border-[#E9DFD9] shadow-card bg-white">
                  <ReelMedia reel={reel} />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Play icon overlay */}
                  {!hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/90 text-[#172333] shadow-md group-hover:scale-110 transition-transform">
                        <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                      </span>
                    </div>
                  )}

                  {/* Bottom caption overlay */}
                  {reel.product?.name && (
                    <div className="absolute inset-x-3 bottom-3 z-10">
                      <p className="text-xs font-medium text-white truncate drop-shadow-sm">
                        {reel.product.name}
                      </p>
                      {reel.product?.slug && (
                        <Link
                          href={`/product/${reel.product.slug}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-[#D8B5A9] hover:text-white font-semibold transition-colors"
                        >
                          <span>Shop Now</span>
                          <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
