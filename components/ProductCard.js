'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/utils';
import { useWishlist } from '@/components/WhishlistContext';
import { useCart } from '@/components/CartContext';

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
  const [open, setOpen] = useState(false); // expanded on touch devices

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
    return {
      productId: product._id,
      variantId: variant?._id,
      comboId: null,
      name: product.name,
      image: variant?.images?.[0],
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
      setOpen(true);
      return false;
    }
    if ((sizeEntry?.stock || 0) <= 0) {
      toast.error('This size is out of stock');
      return false;
    }
    addItem(buildPayload());
    return true;
  }

  function handleBuyNow() {
    if (quickAdd()) router.push('/checkout');
  }

  const stop = (e) => e.stopPropagation();

  return (
    <article
      className="group/card hc relative pt-9 select-none"
      data-open={open ? 'true' : 'false'}
    >
      <Hanger />

      <div
        className="relative rounded-[26px] overflow-hidden bg-white gold-frame shadow-hanger transition-shadow duration-500 group-hover/card:shadow-glow aspect-[3/4.25]"
        style={{ borderWidth: 2.5 }}
      >
        {/* Photo */}
        <Link href={productHref} prefetch={false} aria-label={product.name} className="absolute inset-0 block">
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

        {/* ── Default info panel ── */}
        <div
          className="hc-default absolute inset-x-2.5 bottom-2.5 z-10 rounded-[20px] bg-[#FFF4F3]/95 backdrop-blur-sm border border-white px-3.5 pt-2.5 pb-3 shadow-[0_10px_30px_-12px_rgba(107,24,56,.5)]"
        >
          <Link href={productHref} prefetch={false} className="block">
            <h3 className="font-display font-bold text-[#12233F] text-[15px] sm:text-lg leading-tight line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1 flex items-center gap-1 text-[12px] sm:text-sm">
            <Star size={14} className="text-[#F5A524] fill-[#F5A524]" />
            <span className="font-semibold text-[#12233F]">
              {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
            </span>
            {product.reviewCount > 0 && <span className="text-[#7B5D69]">({product.reviewCount})</span>}
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

          {/* Touch devices have no hover, so give them a clear way to open the card */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Open quick shop"
            className="hc-toggle absolute -top-3.5 right-4 w-7 h-7 rounded-full bg-[#6B1838] text-white flex items-center justify-center shadow-md active:scale-90"
          >
            <ChevronUp size={16} />
          </button>
        </div>

        {/* ── Expanded panel (hover on desktop, tap on touch) ── */}
        <div
          className="hc-panel absolute inset-x-0 bottom-0 z-[15] text-white"
          onClick={stop}
        >
          <div
            className="relative px-3 sm:px-5 pt-8 sm:pt-11 pb-3 sm:pb-4 bg-gradient-to-b from-[#7A1D41] to-[#4A0F28]"
            style={{ borderTopLeftRadius: '70% 38px', borderTopRightRadius: '8% 14px' }}
          >
            {/* glossy gold edge */}
            <span
              className="absolute inset-x-0 top-0 h-[3px] opacity-90"
              style={{
                background: 'linear-gradient(90deg, transparent, #F6D573 25%, #FFE9A6 55%, transparent)',
                borderTopLeftRadius: '70% 38px',
              }}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close quick shop"
              className="hc-close absolute top-2.5 right-3 w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center active:scale-90"
            >
              <ChevronDown size={16} />
            </button>
            <Link href={productHref} prefetch={false} className="block pr-8">
              <h3 className="font-display font-bold text-[15px] sm:text-xl leading-tight line-clamp-1 sm:line-clamp-2">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="hidden sm:block mt-1 text-[13px] text-white/80 leading-snug line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px]">
              <Star size={13} className="text-[#F5A524] fill-[#F5A524]" />
              <span className="font-semibold">{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
              {product.reviewCount > 0 && <span className="text-white/75">({product.reviewCount} Reviews)</span>}
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
                <ShoppingBag size={15} /> Add<span className="hidden sm:inline">&nbsp;to Cart</span>
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
    </article>
  );
}

export default memo(ProductCard);
