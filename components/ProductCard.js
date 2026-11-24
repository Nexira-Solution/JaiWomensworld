'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag, ChevronDown, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/utils';
import { useWishlist } from '@/components/WhishlistContext';
import { useCart } from '@/components/CartContext';
import { useFlipCard } from '@/components/FlipCardContext';

/* Gold hanger that the card hangs from */
function Hanger() {
  return (
    <svg
      viewBox="0 0 120 46"
      className="absolute left-1/2 -translate-x-1/2 top-0 w-[96px] h-auto z-20 pointer-events-none drop-shadow-[0_3px_3px_rgba(180,128,42,.35)] origin-bottom transition-transform duration-500 group-hover/card:rotate-[-2deg]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F6D573" />
          <stop offset=".55" stopColor="#D9A441" />
          <stop offset="1" stopColor="#B4802A" />
        </linearGradient>
      </defs>
      {/* hook */}
      <path
        d="M60 44 V32 C60 26 68 25 68 17 C68 8 60 4 53 7 C47 10 47 17 52 18"
        fill="none"
        stroke="url(#hg)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="52" cy="18.5" r="3" fill="url(#hg)" />
      {/* shoulders */}
      <path d="M4 46 L60 32 L116 46" fill="none" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductCard({ product, priority = false }) {
  const router = useRouter();
  const { addItem } = useCart();
  const variants = product.variants?.length ? product.variants : [];

  const [vIdx, setVIdx] = useState(0);
  const [size, setSize] = useState('');

  // Global single-active-card 3D flip coordinator
  const productId = String(product._id || product.id || product.slug);
  const { activeFlippedProductId, toggleFlip, closeFlip } = useFlipCard();
  const isFlipped = activeFlippedProductId === productId;

  const variant = variants[vIdx] || variants[0];
  const image = variant?.images?.[0] || '/placeholder.png';
  const sizes = variant?.sizes || [];

  const sizeEntry = sizes.find((s) => s.size === size);
  const unitPrice =
    Number(sizeEntry?.price) > 0 ? Number(sizeEntry.price) : product.basePrice || variant?.price || 0;
  const price = size ? unitPrice : product.basePrice || variant?.price || 0;
  const compareAt = variant?.compareAtPrice || 0;
  const hasOffer = compareAt > price;
  const discountPct = hasOffer ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const totalStock = useMemo(() => sizes.reduce((n, s) => n + (s.stock || 0), 0), [sizes]);
  const hasSizeData = sizes.length > 0;
  const outOfStock = hasSizeData && totalStock <= 0;
  const lowStock = hasSizeData && !outOfStock && totalStock <= 5;

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

  const productHref = `/product/${product.slug}`;

  function buildPayload() {
    const rawImg = variant?.images?.[0] || product.variants?.[0]?.images?.[0] || '';
    const resolvedImg = typeof rawImg === 'string' ? rawImg : (Array.isArray(rawImg) ? rawImg[0] : '');
    return {
      productId: product._id,
      variantId: variant?._id,
      comboId: null,
      name: product.name,
      image: resolvedImg,
      color: variant?.color,
      size,
      sleeveType: '',
      zipType: '',
      pantOption: null,
      shawlOption: null,
      price: unitPrice,
      weight: product.weight || 0,
      qty: 1,
      stock: sizeEntry?.stock || 0,
    };
  }

  // Returns true when the item really went into the bag
  function quickAdd() {
    if (product.needsOptions || !variant?._id) {
      toast('Pick your sleeve & fit on the next page', { icon: '✨' });
      router.push(productHref);
      return false;
    }
    if (!size) {
      toast.error('Please select a size');
      return false;
    }
    if ((sizeEntry?.stock || 0) <= 0) {
      toast.error('This size is out of stock');
      return false;
    }
    addItem(buildPayload());
    toast.success('Added to cart');
    return true;
  }

  function handleBuyNow() {
    if (quickAdd()) router.push('/checkout');
  }

  const stop = (e) => e.stopPropagation();

  // Mobile / Tablet 3D Flip Handler
  const handleFlipClick = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      e.preventDefault();
      e.stopPropagation();
      toggleFlip(productId);
    }
  };

  const handleCloseFlip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeFlip();
  };

  return (
    <article className="group/card hc relative pt-9 select-none flip-card-wrapper">
      <Hanger />

      {/* 3D Flip Rotating Container */}
      <div
        className={`flip-card-inner aspect-[3/4.25] ${isFlipped ? 'is-flipped' : ''}`}
      >
        {/* ══════════════ FRONT FACE ══════════════ */}
        <div
          className="flip-card-front gold-frame shadow-hanger transition-shadow duration-500 group-hover/card:shadow-glow bg-white"
          style={{ borderWidth: 2.5 }}
        >
          {/* Photo (tapping navigates directly to product details) */}
          <Link
            href={productHref}
            prefetch={false}
            aria-label={product.name}
            className="absolute inset-0 block"
          >
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={75}
              priority={priority}
              className={`object-cover object-top transition-transform duration-[900ms] ease-out group-hover/card:scale-[1.04] ${
                outOfStock ? 'grayscale opacity-80' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A0F28]/25 via-transparent to-transparent" />
          </Link>

          {/* Hanging discount tag */}
          {(discountPct > 0 || outOfStock) && (
            <div
              className="absolute left-2.5 top-3 z-10 origin-top animate-sway pointer-events-none"
              style={{ '--tilt': '-6deg' }}
            >
              <span className="block mx-auto w-px h-3 bg-[#D9A441]" />
              <div className="relative rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center font-display font-bold leading-[1.05] text-white bg-gradient-to-br from-[#8A2048] to-[#5C1330] border border-dashed border-white/40 shadow-lg">
                {outOfStock ? (
                  <span className="text-[11px] sm:text-xs">Sold<br />out</span>
                ) : (
                  <>
                    <span className="text-base sm:text-xl">{discountPct}%</span>
                    <br />
                    <span className="text-[11px] sm:text-sm tracking-wide">OFF</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
            className="absolute top-3 right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-transform active:scale-90 hover:scale-110"
          >
            <Heart
              className={`w-[18px] h-[18px] transition-all ${wishlisted ? 'animate-pop-in' : ''}`}
              strokeWidth={1.8}
              style={{ color: '#B02F5E' }}
              fill={wishlisted ? '#E5195E' : 'none'}
            />
          </button>

          {/* Default info panel */}
          <div
            className="hc-default absolute inset-x-2.5 bottom-2.5 z-10 rounded-[20px] bg-[#FFF4F3]/95 backdrop-blur-sm border border-white px-3.5 pt-2.5 pb-3 shadow-[0_10px_30px_-12px_rgba(107,24,56,.5)] cursor-pointer"
            onClick={handleFlipClick}
          >
            {/* Title link navigates directly to product details */}
            <Link href={productHref} prefetch={false} className="block group/title" onClick={stop}>
              <h3 className="font-display font-bold text-[#12233F] text-[15px] sm:text-lg leading-tight line-clamp-1 group-hover/title:text-[#6B1838] transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="mt-1 flex items-center gap-1 text-[12px] sm:text-sm">
              {product.rating > 0 && product.reviewCount > 0 ? (
                <>
                  <Star size={14} className="text-[#F5A524] fill-[#F5A524]" />
                  <span className="font-semibold text-[#12233F]">{product.rating.toFixed(1)}</span>
                  <span className="text-[#7B5D69]">({product.reviewCount})</span>
                </>
              ) : (
                <span className="text-[11px] sm:text-xs text-[#7B5D69] font-normal">No ratings yet</span>
              )}
            </div>

            <div className="mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="font-display font-bold text-[#6B1838] text-lg sm:text-[22px] leading-none">
                {formatINR(price)}
              </span>
              {hasOffer && (
                <>
                  <span className="text-xs sm:text-sm text-[#7B5D69] line-through">{formatINR(compareAt)}</span>
                  <span className="text-[10.5px] sm:text-xs font-semibold rounded-full px-2 py-0.5 bg-[#F9B8C6] text-[#8A2048]">
                    Save {formatINR(compareAt - price)}
                  </span>
                </>
              )}
            </div>

            {/* Mobile tap to flip button */}
            <button
              type="button"
              onClick={handleFlipClick}
              className="lg:hidden absolute -top-3 right-3 sm:right-4 px-2 py-0.5 rounded-full bg-[#6B1838] text-white flex items-center gap-1 text-[10px] font-medium shadow-md active:scale-95 cursor-pointer z-20"
              aria-label="Tap to flip card"
            >
              <span>Tap to flip</span>
              <RotateCcw size={10} />
            </button>
          </div>

          {/* ── Desktop Hover Panel (hidden on mobile, slides up on desktop hover) ── */}
          <div
            className="hc-panel hidden lg:block absolute inset-x-0 bottom-0 z-[15] text-white"
            onClick={stop}
          >
            <div
              className="relative px-3 sm:px-5 pt-8 sm:pt-11 pb-3 sm:pb-4 bg-gradient-to-b from-[#7A1D41] to-[#4A0F28]"
              style={{ borderTopLeftRadius: '70% 38px', borderTopRightRadius: '8% 14px' }}
            >
              <span
                className="absolute inset-x-0 top-0 h-[3px] opacity-90"
                style={{
                  background: 'linear-gradient(90deg, transparent, #F6D573 25%, #FFE9A6 55%, transparent)',
                  borderTopLeftRadius: '70% 38px',
                }}
              />
              <Link href={productHref} prefetch={false} className="block pr-2">
                <h3 className="font-display font-bold text-[15px] sm:text-xl leading-tight line-clamp-1 sm:line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {product.description && (
                <p className="mt-1 text-[13px] text-white/80 leading-snug line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px]">
                {product.rating > 0 && product.reviewCount > 0 ? (
                  <>
                    <Star size={13} className="text-[#F5A524] fill-[#F5A524]" />
                    <span className="font-semibold">{product.rating.toFixed(1)}</span>
                    <span className="text-white/75">({product.reviewCount} Reviews)</span>
                  </>
                ) : (
                  <span className="text-white/75 font-normal">No ratings yet</span>
                )}
              </div>

              {lowStock && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#F6D573]">
                  <ShoppingBag size={14} /> Only {totalStock} left in stock!
                </p>
              )}

              {/* Colours */}
              {variants.length > 1 && (
                <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
                  <span className="text-[12px] text-white/85 w-9">Color</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {variants.map((v, i) => (
                      <button
                        key={v._id || i}
                        type="button"
                        onClick={() => {
                          setVIdx(i);
                          setSize('');
                        }}
                        title={v.color}
                        aria-label={`Colour ${v.color || i + 1}`}
                        aria-pressed={i === vIdx}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          i === vIdx ? 'border-white scale-110 ring-2 ring-[#F4A7BA]/60' : 'border-white/30'
                        }`}
                        style={{ background: v.colorHex && v.colorHex !== '#000000' ? v.colorHex : '#F4A7BA' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mt-2.5 flex items-start gap-2">
                  <span className="text-[12px] text-white/85 w-9 pt-1.5">Size</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.slice(0, 7).map((s) => {
                      const gone = (s.stock || 0) <= 0;
                      const active = size === s.size;
                      return (
                        <button
                          key={s.size}
                          type="button"
                          disabled={gone}
                          onClick={() => setSize(s.size)}
                          aria-pressed={active}
                          className={`min-w-[34px] h-8 px-2.5 rounded-full text-[12px] font-semibold border transition-all ${
                            active
                              ? 'bg-white text-[#6B1838] border-white'
                              : gone
                              ? 'border-white/15 text-white/30 line-through cursor-not-allowed'
                              : 'border-white/45 text-white hover:bg-white/15'
                          }`}
                        >
                          {s.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3 sm:mt-3.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={quickAdd}
                  className="flex items-center justify-center gap-1.5 h-10 rounded-full border-2 border-white/70 text-[12.5px] sm:text-[13px] font-semibold hover:bg-white hover:text-[#6B1838] transition-colors disabled:opacity-40"
                >
                  <ShoppingBag size={15} /> Add to Cart
                </button>
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleBuyNow}
                  className="relative overflow-hidden shine-sweep h-10 rounded-full text-[12.5px] sm:text-[13px] font-bold text-[#4A0F28] bg-gradient-to-r from-[#F6D573] via-[#E9B84F] to-[#D9A441] shadow-[0_6px_16px_-6px_rgba(217,164,65,.9)] hover:brightness-105 transition disabled:opacity-40"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ BACK FACE (Mobile 3D Flip Details) ══════════════ */}
        <div
          className="flip-card-back gold-frame shadow-hanger flex flex-col justify-between p-2.5 sm:p-3 text-white overflow-hidden select-none"
          style={{
            borderWidth: 2.5,
            background: 'linear-gradient(165deg, #7A1D41 0%, #4A0F28 60%, #300819 100%)',
          }}
          onClick={handleCloseFlip}
        >
          {/* Top Bar: Sparkles badge + Flip-back Close button */}
          <div className="flex items-center justify-between shrink-0" onClick={stop}>
            <span className="text-[9.5px] uppercase tracking-[0.18em] font-semibold text-[#F6D573] flex items-center gap-1">
              <Sparkles size={10} /> Quick Select
            </span>
            <button
              type="button"
              onClick={handleCloseFlip}
              className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all border border-white/20 shadow-xs cursor-pointer"
              aria-label="Flip back to front"
              title="Flip back"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Middle Content: fits without vertical overflow */}
          <div className="flex-1 min-h-0 flex flex-col justify-evenly py-0.5 overflow-hidden">
            {/* Product Name & View Details link */}
            <div onClick={stop}>
              <Link href={productHref} onClick={stop} className="block group/title">
                <h3 className="font-display font-bold text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover/title:text-[#F6D573] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <Link
                href={productHref}
                onClick={stop}
                className="inline-flex items-center gap-0.5 text-[9.5px] text-[#F6D573] hover:underline font-medium mt-0.5 w-fit"
              >
                <span>View Details</span>
                <ArrowRight size={9} />
              </Link>
            </div>

            {/* Rating & Price Row */}
            <div className="flex items-center justify-between gap-1 py-0.5" onClick={stop}>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-display font-bold text-[#F6D573] text-sm sm:text-base leading-none">
                  {formatINR(price)}
                </span>
                {hasOffer && (
                  <>
                    <span className="text-[10px] text-white/60 line-through">
                      {formatINR(compareAt)}
                    </span>
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-[#F4A7BA]/25 text-[#FFD3DE]">
                      Save {formatINR(compareAt - price)}
                    </span>
                  </>
                )}
              </div>
              {product.rating > 0 && product.reviewCount > 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] text-white/90 shrink-0">
                  <Star size={10} className="text-[#F5A524] fill-[#F5A524]" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-white/65">({product.reviewCount})</span>
                </div>
              ) : (
                <span className="text-[9.5px] text-white/60 shrink-0">Boutique Edit</span>
              )}
            </div>

            {/* Color Variants (if any) */}
            {variants.length > 1 && (
              <div className="flex items-center gap-1.5 py-0.5" onClick={stop}>
                <span className="text-[10px] text-white/80 shrink-0">Color:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {variants.map((v, i) => (
                    <button
                      key={v._id || i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVIdx(i);
                        setSize('');
                      }}
                      title={v.color}
                      aria-label={`Color ${v.color || i + 1}`}
                      aria-pressed={i === vIdx}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        i === vIdx ? 'border-white scale-110 ring-1 ring-[#F4A7BA]' : 'border-white/30'
                      }`}
                      style={{ background: v.colorHex && v.colorHex !== '#000000' ? v.colorHex : '#F4A7BA' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="py-0.5" onClick={stop}>
                <div className="flex items-center justify-between text-[10px] text-white/85 font-medium mb-1">
                  <span>Select Size:</span>
                  {size && <span className="text-[#F6D573] font-bold">{size}</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {sizes.slice(0, 6).map((s) => {
                    const gone = (s.stock || 0) <= 0;
                    const active = size === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={gone}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSize(s.size);
                        }}
                        aria-pressed={active}
                        className={`min-w-[28px] h-6 px-1.5 rounded-full text-[10px] font-semibold border transition-all ${
                          active
                            ? 'bg-white text-[#6B1838] border-white shadow-xs font-bold scale-105'
                            : gone
                            ? 'border-white/15 text-white/30 line-through cursor-not-allowed'
                            : 'border-white/40 text-white hover:bg-white/20 active:scale-95'
                        }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Cart & Buy Now */}
          <div className="shrink-0 pt-1 mt-auto" onClick={stop}>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={outOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  quickAdd();
                }}
                className="flex items-center justify-center gap-1 h-8 rounded-full border border-white/60 bg-[#6B1838]/40 hover:bg-[#6B1838]/70 active:scale-95 text-white font-semibold text-[11px] whitespace-nowrap transition-all disabled:opacity-40 cursor-pointer"
              >
                <ShoppingBag size={12} strokeWidth={2} />
                <span>Cart</span>
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                className="relative overflow-hidden shine-sweep flex items-center justify-center gap-1 h-8 rounded-full text-[11px] font-bold text-[#4A0F28] bg-gradient-to-r from-[#F6D573] via-[#E9B84F] to-[#D9A441] shadow-xs hover:brightness-105 active:scale-95 whitespace-nowrap transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Flip Back Footer Button */}
            <button
              type="button"
              onClick={handleCloseFlip}
              className="w-full text-center text-[9px] text-white/70 hover:text-white flex items-center justify-center gap-0.5 pt-1 cursor-pointer transition-colors"
              aria-label="Close details"
            >
              <ChevronDown size={11} />
              <span>Tap to flip back</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
