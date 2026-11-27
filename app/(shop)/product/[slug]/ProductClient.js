'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getSizeStock, getCombinedStock } from '@/lib/stock';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WhishlistContext';
import ColorSizeSelector from '@/components/ColorSizeSelector';
import RelatedProducts from '@/components/RelatedProducts';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import toast from 'react-hot-toast';

const SizeChartModal = dynamic(() => import('@/components/SizeChartModal'), { ssr: false });
const Lightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false });

export default function ProductClient({ data }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { product, reviews, related } = data;

  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] ?? null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [activeSleeve, setActiveSleeve] = useState('');
  const [activeZip, setActiveZip] = useState('');
  const [activePantId, setActivePantId] = useState('');
  const [activeShawlId, setActiveShawlId] = useState('');
  const [qty, setQty] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  const wished = isWishlisted(product._id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = activeVariant?.images || [];
  const mediaList = useMemo(() => {
    const list = images.map((src) => ({ type: 'image', src }));
    if (product.video) {
      list.push({ type: 'video', src: product.video });
    }
    return list;
  }, [images, product.video]);

  const activeMedia = mediaList[activeImage] || mediaList[0] || null;
  const variantPrice = activeVariant?.price || 0;
  const sizeEffectivePrice = (s) => (Number(s?.price) > 0 ? Number(s.price) : variantPrice);
  const selectedSizeObj = activeVariant?.sizes?.find((s) => s.size === activeSize);
  const sizePrices = (activeVariant?.sizes || []).map(sizeEffectivePrice);
  const pricesVary = sizePrices.some((p) => p !== sizePrices[0]);
  const showFrom = !selectedSizeObj && pricesVary;
  const currentBasePrice = selectedSizeObj
    ? sizeEffectivePrice(selectedSizeObj)
    : pricesVary
    ? Math.min(...sizePrices)
    : variantPrice;
  const compareBase =
    activeVariant?.compareAtPrice > currentBasePrice ? activeVariant.compareAtPrice : 0;
  const discount = compareBase
    ? Math.round(((compareBase - currentBasePrice) / compareBase) * 100)
    : 0;

  // Collect all gallery images across all variants of this product to guarantee
  // that product gallery photos are NEVER used as size chart images.
  const galleryImageUrls = useMemo(() => {
    const urls = new Set();
    (product.variants || []).forEach((v) => {
      (v.images || []).forEach((img) => {
        if (img) urls.add(String(img).trim());
      });
    });
    return urls;
  }, [product.variants]);

  // Actual size chart images from product or category (dynamically fetched from backend).
  // Strictly filters out any image that belongs to the product gallery or empty values.
  const sizeChartImages = useMemo(() => {
    const rawList = product.sizeChart?.length
      ? product.sizeChart
      : product.category?.sizeChart || [];

    const seen = new Set();
    const result = [];
    for (const item of rawList) {
      const url = String(item || '').trim();
      if (!url || seen.has(url)) continue;
      // Do not allow product gallery images as size chart images
      if (galleryImageUrls.has(url)) continue;
      seen.add(url);
      result.push(url);
    }
    return result;
  }, [product.sizeChart, product.category?.sizeChart, galleryImageUrls]);

  const selectedSizeStock = getSizeStock(activeVariant, activeSize);
  const sizeOutOfStock = !!activeSize && selectedSizeStock <= 0;

  const selectedPant = useMemo(
    () => product.pantOptions?.find((p) => p._id === activePantId) || null,
    [product.pantOptions, activePantId]
  );
  const selectedShawl = useMemo(
    () => product.shawlOptions?.find((s) => s._id === activeShawlId) || null,
    [product.shawlOptions, activeShawlId]
  );
  const addonTotal = (selectedPant?.price || 0) + (selectedShawl?.price || 0);
  const unitPrice = currentBasePrice + addonTotal;
  const unitCompareAtPrice = compareBase ? compareBase + addonTotal : 0;

  const computeStock = useCallback(
    (variant, size, pantId, shawlId) =>
      getCombinedStock(variant, size, {
        pantOptions: product.pantOptions,
        pantOptionId: pantId,
        shawlOptions: product.shawlOptions,
        shawlOptionId: shawlId,
      }),
    [product.pantOptions, product.shawlOptions]
  );

  const stock = useMemo(
    () => computeStock(activeVariant, activeSize, activePantId, activeShawlId),
    [computeStock, activeVariant, activeSize, activePantId, activeShawlId]
  );
  const finiteStock = stock !== Infinity;
  const plusDisabled = !!activeSize && finiteStock && qty >= stock;
  const lowStockLeft = !!activeSize && finiteStock && stock > 0 && stock <= 5 ? stock : null;

  const prevImage = () => setActiveImage((i) => (i === 0 ? mediaList.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === mediaList.length - 1 ? 0 : i + 1));

  // Touch Swipe on mobile
  const touchStartX = useRef(null);
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    setPaused(false);
    if (touchStartX.current == null || mediaList.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) dx < 0 ? nextImage() : prevImage();
  };

  function handleWish() {
    toggleWishlist(product._id);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  }

  function handleColorChange(v) {
    setActiveVariant(v);
    setActiveImage(0);
    setActiveSize('');
    setQty(1);
  }

  function handleSizeChange(size) {
    setActiveSize(size);
    const s = computeStock(activeVariant, size, activePantId, activeShawlId);
    setQty((q) => (s > 0 && s !== Infinity ? Math.min(q, s) : 1));
  }

  function handlePantChange(id) {
    setActivePantId(id);
    const s = computeStock(activeVariant, activeSize, id, activeShawlId);
    if (s !== Infinity) setQty((q) => Math.min(q, Math.max(s, 1)));
  }

  function handleShawlChange(id) {
    setActiveShawlId(id);
    const s = computeStock(activeVariant, activeSize, activePantId, id);
    if (s !== Infinity) setQty((q) => Math.min(q, Math.max(s, 1)));
  }

  function buildCartPayload() {
    const rawImg = activeVariant?.images?.[0] || product.variants?.[0]?.images?.[0] || '';
    const resolvedImg = typeof rawImg === 'string' ? rawImg : (Array.isArray(rawImg) ? rawImg[0] : '');
    return {
      productId: product._id,
      variantId: activeVariant._id,
      comboId: null,
      name: product.name,
      image: resolvedImg,
      color: activeVariant.color,
      size: activeSize,
      sleeveType: activeSleeve,
      zipType: activeZip,
      pantOption: selectedPant
        ? {
            id: selectedPant._id,
            name: selectedPant.name,
            price: selectedPant.price,
            image: selectedPant.image,
            sku: selectedPant.sku,
          }
        : null,
      shawlOption: selectedShawl
        ? {
            id: selectedShawl._id,
            name: selectedShawl.name,
            price: selectedShawl.price,
            image: selectedShawl.image,
            sku: selectedShawl.sku,
          }
        : null,
      price: unitPrice,
      weight: product.weight || 0,
      qty,
      stock,
    };
  }

  function validateAndAdd() {
    if (!activeSize) {
      toast.error('Please select a size');
      return false;
    }
    if (product.sleeveOptions?.length && !activeSleeve) {
      toast.error('Please select a sleeve type');
      return false;
    }
    if (product.zipOptions?.length && !activeZip) {
      toast.error('Please select a zip type');
      return false;
    }
    if (stock <= 0) {
      toast.error('This combination is currently out of stock');
      return false;
    }
    if (qty > stock) {
      toast.error(`Only ${stock} left in stock`);
      setQty(stock);
      return false;
    }
    addItem(buildCartPayload());
    toast.success('Added to your shopping bag!');
    return true;
  }

  const handleAddToCart = () => {
    validateAndAdd();
  };
  const handleBuyNow = () => {
    if (validateAndAdd()) router.push('/checkout');
  };

  return (
    <div className="bg-[#FFF4F3] min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7B5D69] mb-6 font-light">
          <Link href="/" className="hover:text-[#12233F] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#12233F] transition-colors">Collections</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link href={`/category/${product.category.slug}`} className="hover:text-[#12233F] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#12233F] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Detail Main Card */}
        <div className="bg-white rounded-xl border border-[#F5D5DB] shadow-card p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            
            {/* Left: Gallery Column */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnails list (Desktop/Tablet) */}
              {mediaList.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[550px] no-scrollbar shrink-0">
                  {mediaList.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-20 rounded overflow-hidden border transition-all shrink-0 ${
                        i === activeImage ? 'border-[#B02F5E] shadow-sm ring-1 ring-[#B02F5E]' : 'border-[#F5D5DB] hover:border-[#F4A7BA]'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-[#12233F] flex flex-col items-center justify-center text-white p-1">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mb-1">
                            <svg className="w-3.5 h-3.5 fill-current text-white translate-x-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span className="text-[9px] uppercase tracking-wider font-semibold">Video</span>
                        </div>
                      ) : (
                        <Image src={item.src} alt={`Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Active Media View */}
              <div
                className="relative flex-1 aspect-[3/4] max-h-[600px] rounded-lg overflow-hidden border border-[#F5D5DB] bg-[#FCE4E8]/40 group"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {activeMedia?.type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={activeMedia.src}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : activeMedia?.src ? (
                  <Image
                    src={activeMedia.src}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover object-top cursor-zoom-in"
                    onClick={() => setLightboxImg(activeMedia.src)}
                  />
                ) : null}

                {/* Offer / Stock Tag */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                  {discount > 0 && (
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-[#D9A441] text-[#12233F] shadow-sm">
                      {discount}% OFF
                    </span>
                  )}
                  {lowStockLeft && (
                    <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded bg-[#B02F5E] text-white">
                      Only {lowStockLeft} Left
                    </span>
                  )}
                </div>

                {/* Media Navigation Arrows */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#12233F] shadow-sm flex items-center justify-center border border-[#F5D5DB] transition-all z-10"
                      aria-label="Previous Media"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#12233F] shadow-sm flex items-center justify-center border border-[#F5D5DB] transition-all z-10"
                      aria-label="Next Media"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right: Product Info & Purchase Action */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Action Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B02F5E]">
                    Jai Boutique Exclusive
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-8 h-8 rounded-full border border-[#F5D5DB] flex items-center justify-center text-[#7B5D69] hover:text-[#12233F] transition-colors"
                      title="Share product"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleWish}
                      className="w-8 h-8 rounded-full border border-[#F5D5DB] flex items-center justify-center transition-colors"
                      style={{ color: wished ? '#B02F5E' : '#12233F' }}
                      title="Add to wishlist"
                    >
                      <Heart size={14} fill={wished ? '#B02F5E' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#12233F] mt-2 leading-snug">
                  {product.name}
                </h1>

                {/* Dynamic Rating & Reviews Summary */}
                <div className="mt-2.5 flex items-center gap-2">
                  {product.rating > 0 && product.reviewCount > 0 ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.round(product.rating)
                                ? 'fill-[#D9A441] text-[#D9A441]'
                                : 'text-[#F5D5DB]'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#12233F]">
                        {product.rating.toFixed(1)}/5
                      </span>
                      <span className="text-xs text-[#7B5D69]">
                        ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#7B5D69]">
                      <Star size={13} className="text-[#F5D5DB]" />
                      <span>No ratings yet</span>
                      <span>•</span>
                      <span>0 reviews</span>
                    </div>
                  )}
                </div>

                {/* Pricing Block */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-[#12233F]">
                    {showFrom && <span className="text-sm font-normal text-[#7B5D69] mr-1">From</span>}
                    {formatINR(unitPrice)}
                  </span>

                  {unitCompareAtPrice > unitPrice && (
                    <span className="text-base text-[#7B5D69] line-through font-light">
                      {formatINR(unitCompareAtPrice)}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#B02F5E]/15 text-[#B02F5E]">
                      Save {formatINR(unitCompareAtPrice - unitPrice)}
                    </span>
                  )}
                </div>

                {addonTotal > 0 && (
                  <p className="text-xs text-[#7B5D69] mt-1 font-light">
                    Includes {formatINR(addonTotal)} for chosen matching add-ons
                  </p>
                )}

                {/* Fabric note */}
                {product.fabric && (
                  <p className="text-xs text-[#7B5D69] mt-3">
                    Fabric: <strong className="text-[#12233F] font-medium">{product.fabric}</strong>
                  </p>
                )}

                {/* Selectors: Colors, Sizes, Addons */}
                <div className="mt-6 pt-6 border-t border-[#F5D5DB]">
                  <ColorSizeSelector
                    variants={product.variants}
                    activeVariant={activeVariant}
                    onColorChange={handleColorChange}
                    activeSize={activeSize}
                    onSizeChange={handleSizeChange}
                    categoryType={product.category?.type}
                    sizeChartImages={sizeChartImages}
                    onViewSizeChart={() => setSizeChartOpen(true)}
                    sleeveOptions={product.sleeveOptions}
                    zipOptions={product.zipOptions}
                    activeSleeve={activeSleeve}
                    onSleeveChange={setActiveSleeve}
                    activeZip={activeZip}
                    onZipChange={setActiveZip}
                    pantOptions={product.pantOptions}
                    activePantId={activePantId}
                    onPantChange={handlePantChange}
                    shawlOptions={product.shawlOptions}
                    activeShawlId={activeShawlId}
                    onShawlChange={handleShawlChange}
                    formatINR={formatINR}
                  />
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mt-6">
                  <span className="text-xs uppercase tracking-wider text-[#7B5D69] font-medium">Quantity</span>
                  <div className="flex items-center border border-[#F5D5DB] rounded bg-[#FFF4F3]">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-[#12233F] hover:bg-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-xs font-semibold text-[#12233F]">{qty}</span>
                    <button
                      onClick={() => setQty((q) => (stock > 0 && finiteStock ? Math.min(stock, q + 1) : q + 1))}
                      disabled={plusDisabled}
                      className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-[#12233F] hover:bg-white transition-colors disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons (Visible on Mobile & Desktop) */}
                <div className="flex flex-col gap-3 mt-6 sm:mt-8">
                  <button
                    onClick={handleBuyNow}
                    disabled={sizeOutOfStock}
                    className="w-full py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-boutique flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Zap size={15} />
                    <span>{sizeOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={sizeOutOfStock}
                    className="w-full py-3.5 rounded bg-white hover:bg-[#FCE4E8] text-[#12233F] border border-[#12233F] text-xs uppercase tracking-[0.16em] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <ShoppingBag size={15} />
                    <span>{sizeOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                  </button>
                </div>

                {/* Assurance Badges */}
                <div className="pt-6 mt-6 border-t border-[#F5D5DB] grid grid-cols-3 gap-2 text-center text-[10.5px] text-[#7B5D69]">
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck size={16} className="text-[#D9A441]" />
                    <span>Pure Fabric Quality</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Truck size={16} className="text-[#B02F5E]" />
                    <span>Safe All-India Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw size={16} className="text-[#12233F]" />
                    <span>Easy Order Support</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-6 border-t border-[#F5D5DB]">
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#12233F] mb-2">
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7B5D69] font-light leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts items={related} />

        {/* Customer Reviews Section (Placed below Related Products) */}
        <ProductReviewsSection product={product} initialReviews={reviews} />

      </div>

      {/* Modals */}
      {mounted && lightboxImg && <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
      {mounted && sizeChartOpen && (
        <SizeChartModal
          images={sizeChartImages}
          category={product.category}
          productName={product.name}
          customTable={product.sizeChartTable?.length ? product.sizeChartTable : product.category?.sizeChartTable}
          availableSizes={activeVariant?.sizes?.map((s) => s.size) || []}
          onClose={() => setSizeChartOpen(false)}
        />
      )}
    </div>
  );
}
