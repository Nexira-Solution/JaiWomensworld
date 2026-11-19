'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getVariantTotalStock } from '@/lib/stock';
import { useWishlist } from '@/components/WhishlistContext';

function ProductCard({ product, priority = false }) {
  const variant = product.variants?.[0];
  const image = variant?.images?.[0] || '/placeholder.png';
  const price = product.basePrice || variant?.price || 0;
  const compareAt = variant?.compareAtPrice || 0;
  const hasOffer = compareAt > price;
  const discountPct = hasOffer ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const totalStock = getVariantTotalStock(variant);
  const outOfStock = totalStock <= 0;
  const lowStock = !outOfStock && totalStock <= 5;

  const wishId = product.id ?? product._id ?? product.slug;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(wishId);

  const handleWishlistClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(wishId);
    },
    [toggleWishlist, wishId]
  );

  return (
    <div className="group relative flex flex-col bg-white rounded-md overflow-hidden border border-[#E9DFD9] hover:border-[#D8B5A9] hover:shadow-card transition-all duration-300">
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={wishlisted}
        className="absolute top-3 right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-transform active:scale-90 hover:bg-white"
      >
        <Heart
          className="w-4 h-4 transition-colors"
          strokeWidth={1.75}
          style={{ color: wishlisted ? '#B98270' : '#172333' }}
          fill={wishlisted ? '#B98270' : 'none'}
        />
      </button>

      {/* Product Image Clickable Link */}
      <Link href={`/product/${product.slug}`} prefetch={false} className="block relative aspect-[3/4] overflow-hidden bg-[#F4E8E3]/40">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
          priority={priority}
          className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
            outOfStock ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Status / Offer Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {outOfStock ? (
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[#172333]/80 text-[#F5F0E9]">
              Sold Out
            </span>
          ) : lowStock ? (
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[#B98270] text-white">
              Only {totalStock} Left
            </span>
          ) : discountPct > 0 ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#BFA078] text-[#172333] shadow-sm">
              {discountPct}% OFF
            </span>
          ) : null}
        </div>

        {/* Hover Quick View Pill (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:flex items-center justify-center py-2 rounded bg-white/95 backdrop-blur-xs text-[11px] font-medium tracking-wider uppercase text-[#172333] shadow-sm">
          <span>View Details</span>
          <ArrowUpRight size={13} className="ml-1 text-[#B98270]" />
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Subtle Category or Brand Tag */}
          <span className="text-[10px] uppercase tracking-widest text-[#B98270] font-medium block mb-1">
            Jai Boutique
          </span>

          <Link href={`/product/${product.slug}`} prefetch={false}>
            <h3 className="font-body text-xs sm:text-sm font-medium text-[#171717] line-clamp-2 leading-snug group-hover:text-[#B98270] transition-colors min-h-[2.3rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing Area */}
        <div className="mt-3 pt-2.5 border-t border-[#E9DFD9]/60 flex items-baseline justify-between flex-wrap gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm sm:text-base text-[#172333]">
              {formatINR(price)}
            </span>
            {hasOffer && (
              <span className="text-xs text-[#77716F] line-through font-light">
                {formatINR(compareAt)}
              </span>
            )}
          </div>

          {hasOffer && (
            <span className="text-[10px] text-[#B98270] font-medium">
              Save {formatINR(compareAt - price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
