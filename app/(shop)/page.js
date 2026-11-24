import { dbConnect } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Combo from '@/models/Combo';
import Category from '@/models/Category';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import Reveal from '@/components/Reveal';
import { LotusDivider, SilkWaves } from '@/components/Decor';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';
import Reel from '@/models/Reel';
import ReelsSection from '@/components/ReelsSection';

import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { toCardProduct } from '@/lib/cardProduct';
import {
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const FEATURED_LIMIT = 8;
const REELS_LIMIT = 10;

// Rich Sample Products for Jai Womens World Boutique
const SAMPLE_PRODUCTS = [
  {
    _id: 'sample-p1',
    name: 'Floral Anarkali Rayon Umbrella Kurti',
    slug: 'floral-anarkali-rayon-umbrella-kurti',
    basePrice: 799,
    rating: 4.9,
    soldCount: 142,
    isBestSeller: true,
    variants: [
      {
        sku: 'JWW-KURTI-01',
        title: 'Rose Wine',
        price: 799,
        originalPrice: 1299,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 25,
      },
    ],
  },
  {
    _id: 'sample-p2',
    name: 'Pure Cotton Straight Cut Side Open Kurti',
    slug: 'pure-cotton-straight-cut-side-open-kurti',
    basePrice: 549,
    rating: 4.8,
    soldCount: 98,
    isTopSeller: true,
    variants: [
      {
        sku: 'JWW-KURTI-02',
        title: 'Sage Green',
        price: 549,
        originalPrice: 899,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 18,
      },
    ],
  },
  {
    _id: 'sample-p3',
    name: 'Handcrafted Festive Salwar Suit Set (With Dupatta)',
    slug: 'handcrafted-festive-salwar-suit-set',
    basePrice: 1299,
    rating: 5.0,
    soldCount: 86,
    isBestSeller: true,
    variants: [
      {
        sku: 'JWW-SALWAR-01',
        title: 'Powder Blue',
        price: 1299,
        originalPrice: 1999,
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 12,
      },
    ],
  },
  {
    _id: 'sample-p4',
    name: 'Soft Breathable Cotton Printed Daily Nighty',
    slug: 'soft-breathable-cotton-printed-daily-nighty',
    basePrice: 399,
    rating: 4.9,
    soldCount: 210,
    isTopSeller: true,
    variants: [
      {
        sku: 'JWW-NIGHTY-01',
        title: 'Blush Pink',
        price: 399,
        originalPrice: 650,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 30,
      },
    ],
  },
  {
    _id: 'sample-p5',
    name: 'Chic Embroidered 2-Piece Kurti & Pant Set',
    slug: 'chic-embroidered-2-piece-kurti-pant-set',
    basePrice: 999,
    rating: 4.8,
    soldCount: 74,
    variants: [
      {
        sku: 'JWW-SET-01',
        title: 'Ivory Navy',
        price: 999,
        originalPrice: 1499,
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 15,
      },
    ],
  },
  {
    _id: 'sample-p6',
    name: 'Tiered Flared Umbrella Party Kurti',
    slug: 'tiered-flared-umbrella-party-kurti',
    basePrice: 849,
    rating: 4.9,
    soldCount: 115,
    variants: [
      {
        sku: 'JWW-KURTI-03',
        title: 'Rust Terracotta',
        price: 849,
        originalPrice: 1350,
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 20,
      },
    ],
  },
  {
    _id: 'sample-p7',
    name: 'Traditional Jaipuri Printed A-Line Kurti',
    slug: 'traditional-jaipuri-printed-a-line-kurti',
    basePrice: 649,
    rating: 4.7,
    soldCount: 65,
    variants: [
      {
        sku: 'JWW-KURTI-04',
        title: 'Indigo Blue',
        price: 649,
        originalPrice: 999,
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 22,
      },
    ],
  },
  {
    _id: 'sample-p8',
    name: 'Loom-Woven Comfort Fit Salwar Kurti Duo',
    slug: 'loom-woven-comfort-fit-salwar-kurti-duo',
    basePrice: 1149,
    rating: 5.0,
    soldCount: 92,
    variants: [
      {
        sku: 'JWW-SALWAR-02',
        title: 'Mustard Gold',
        price: 1149,
        originalPrice: 1750,
        images: [
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
        ],
        stock: 14,
      },
    ],
  },
];

// Sample pieces shown only while the database has no products yet.
// Reshaped so the new product card gets colours, sizes and compare-at prices.
const SAMPLE_SIZES = ['S', 'M', 'L', 'XL'].map((size, i) => ({ size, stock: [6, 9, 4, 2][i] }));
const SAMPLE_SILK_SAREE = {
  _id: 'sample-saree',
  name: 'Silk Cotton Saree',
  slug: 'silk-cotton-saree',
  basePrice: 2099,
  rating: 0,
  reviewCount: 0,
  description: 'Elegant silk cotton saree with traditional zari border.',
  isBestSeller: true,
  variants: [
    { _id: 'sv1', color: 'Rose', colorHex: '#F28AA0', price: 2099, compareAtPrice: 2999, images: ['/images/hero/hero-model.jpg'], sizes: [{ size: 'Free', stock: 3 }] },
    { _id: 'sv2', color: 'Purple', colorHex: '#8E3A8F', price: 2099, compareAtPrice: 2999, images: ['/images/hero/hero-model.jpg'], sizes: [{ size: 'Free', stock: 3 }] },
    { _id: 'sv3', color: 'Navy', colorHex: '#12233F', price: 2099, compareAtPrice: 2999, images: ['/images/hero/hero-model.jpg'], sizes: [{ size: 'Free', stock: 3 }] },
  ],
};
const SAMPLE_PRODUCTS_READY = [
  SAMPLE_SILK_SAREE,
  ...SAMPLE_PRODUCTS.map((p) => ({
    ...p,
    rating: 0,
    reviewCount: 0,
    description: 'Soft, breathable fabric with a graceful fall and boutique-quality stitching.',
    variants: p.variants.map((v, i) => ({
      ...v,
      _id: `${p._id}-v${i}`,
      color: v.title,
      compareAtPrice: v.originalPrice,
      sizes: SAMPLE_SIZES,
    })),
  })),
];

async function getData() {
  try {
    await dbConnect();
    const [banners, newArrivals, reviews, combos, categories, reels] = await Promise.all([
      Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      Product.find({ isActive: true, isActiveSeller: true })
        .sort({ createdAt: -1 })
        .limit(FEATURED_LIMIT)
        .lean(),
      Review.find({ $or: [{ status: 'approved' }, { isApproved: true }], isFeatured: true }).populate('product', 'name').limit(10).lean(),
      Combo.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
      Category.find({ isActive: true, parent: null }).sort({ sortOrder: 1, name: 1 }).limit(10).lean(),
      Reel.find({ isActive: true })
        .sort({ sortOrder: 1, createdAt: -1 })
        .populate('product', 'name slug')
        .limit(REELS_LIMIT)
        .lean(),
    ]);

    return JSON.parse(
      JSON.stringify({
        banners,
        newArrivals,
        reviews,
        combos,
        categories,
        reels,
      })
    );
  } catch (err) {
    console.error('Database connection or query error in HomePage getData():', err?.message || err);
    return {
      banners: [],
      newArrivals: [],
      reviews: [],
      combos: [],
      categories: [],
      reels: [],
    };
  }
}

export default async function HomePage() {
  const {
    banners,
    newArrivals: dbArrivals,
    reviews,
    combos: dbCombos,
    categories: plainCategories,
    reels,
  } = await getData();

  // Use dynamic products if in DB, otherwise use authentic sample boutique products
  const displayProducts = dbArrivals && dbArrivals.length > 0 ? dbArrivals : SAMPLE_PRODUCTS_READY;
  const displayCombos = dbCombos || [];

  return (
    <div className="overflow-x-hidden bg-[#FFF4F3]">
      {/* ── HERO (admin banners if any, otherwise the built-in landing hero) ── */}
      <BannerCarousel banners={banners} watchHref={reels?.length ? '#reels' : '/combo'} />

      {/* ── SHOP BY CATEGORY (clothesline) ── */}
      <CategoryShowcase categories={plainCategories} />

      {/* ── NEW ARRIVALS ── */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#FFF4F3] via-white to-[#FFF4F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12 sm:mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#12233F]">
              Fresh <span className="text-[#B02F5E]">Arrivals</span>
            </h2>
            <LotusDivider className="mt-3" />
            <p className="mt-3 text-sm sm:text-base text-[#7B5D69] max-w-md mx-auto">
              Hover or tap any piece to pick a colour and size, then add it straight to your bag.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {displayProducts.map((p, i) => (
              <ProductCard key={p._id} product={toCardProduct(p)} priority={i < 4} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/products" className="btn-primary group text-base">
              <span>Explore All Collections</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMBO OFFERS ── */}
      {displayCombos?.length > 0 && (
        <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#FFF4F3] via-[#FCE4E8] to-[#FFF4F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#12233F]">
                Combo <span className="text-[#B02F5E]">Offers</span>
              </h2>
              <LotusDivider className="mt-3" />
              <p className="mt-3 text-sm sm:text-base text-[#7B5D69] max-w-md mx-auto">
                Buy together and save more on our favourite pairings.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayCombos.map((c) => {
                const isColorPack = c.type === 'color-pack';
                const cheapestPack =
                  isColorPack && c.packOptions?.length
                    ? c.packOptions.reduce((min, p) => (p.price < min.price ? p : min), c.packOptions[0])
                    : null;

                const cover = c.images?.[0] || c.image;
                const displayPrice = isColorPack ? cheapestPack?.price ?? 0 : c.comboPrice;
                const originalPrice = isColorPack ? cheapestPack?.originalPrice ?? 0 : c.originalPrice;
                const savings = originalPrice > displayPrice ? originalPrice - displayPrice : 0;

                return (
                  <Link
                    key={c._id}
                    href={`/combo/${c.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[26px] bg-white gold-frame shadow-hanger transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden bg-[#FCE4E8]">
                      {cover ? (
                        <img
                          src={cover}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-[#7B5D69]">Combo set</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0F28]/35 to-transparent" />
                      {savings > 0 && (
                        <span className="absolute top-3 left-3 rounded-full bg-gradient-to-br from-[#8A2048] to-[#5C1330] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                          Save {formatINR(savings)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      <div>
                        <h3 className="font-display font-bold text-xl text-[#12233F] group-hover:text-[#B02F5E] transition-colors">
                          {c.name}
                        </h3>
                        {c.description && (
                          <p className="mt-1.5 text-sm text-[#7B5D69] line-clamp-2">{c.description}</p>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display font-bold text-2xl text-[#6B1838]">{formatINR(displayPrice)}</span>
                          {originalPrice > displayPrice && (
                            <span className="text-sm text-[#7B5D69] line-through">{formatINR(originalPrice)}</span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FCE4E8] px-4 py-2 text-sm font-semibold text-[#8A2048] transition-colors group-hover:bg-[#B02F5E] group-hover:text-white">
                          View pack <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STORY / PROMISES ── */}
      <section className="relative py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-6 order-2 lg:order-1 space-y-6 text-center lg:text-left">
              <h2 className="font-display font-bold text-3xl sm:text-5xl leading-[1.1] text-[#12233F]">
                Crafted with devotion,
                <br />
                designed for <span className="text-[#B02F5E]">modern grace</span>
              </h2>
              <p className="text-base leading-relaxed text-[#7B5D69] max-w-xl mx-auto lg:mx-0">
                At Jai Womens World every piece is chosen with care: breezy daily cottons, graceful rayon flares,
                festive salwar suits and silk sarees, all from our Tiruvannamalai boutique to your doorstep.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
                {[
                  { Icon: ShieldCheck, t: 'Quality checked', d: 'Hand-inspected stitching and fabric.' },
                  { Icon: Truck, t: 'Ships across India', d: 'Reliable couriers to your door.' },
                  { Icon: HeartHandshake, t: 'WhatsApp help', d: 'Real people to help with sizing.' },
                ].map(({ Icon, t, d }) => (
                  <div key={t} className="rounded-3xl bg-[#FFF4F3] border border-[#F5D5DB] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#F6D573] to-[#D9A441] text-[#4A0F28]">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-3 font-display font-bold text-[15px] text-[#12233F]">{t}</h3>
                    <p className="mt-1 text-[13px] text-[#7B5D69]">{d}</p>
                  </div>
                ))}
              </div>

              <Link href="/about" className="inline-flex items-center gap-2 font-semibold text-[#B02F5E] hover:text-[#12233F] transition-colors">
                Read our story <ArrowRight size={16} />
              </Link>
            </Reveal>

            <Reveal className="lg:col-span-6 order-1 lg:order-2 flex justify-center" delay={120}>
              <div className="relative w-[78%] max-w-[380px]">
                <div className="absolute -inset-4 rounded-t-[999px] rounded-b-[36px] bg-gradient-to-b from-[#F6D573]/70 to-transparent blur-sm" aria-hidden="true" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[30px] gold-frame shadow-hanger" style={{ borderWidth: 3 }}>
                  <Image
                    src="/images/categories/kurtis.jpg"
                    alt="Woman in a navy embroidered kurti"
                    fill
                    sizes="(max-width:1024px) 80vw, 380px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 flex justify-center w-max max-w-[92vw]">
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#12233F] px-4 py-2 sm:px-6 sm:py-2.5 text-white shadow-xl animate-float border border-[#F6D573]/30">
                    <span className="font-display font-bold text-xs sm:text-base tracking-wide text-white">Jai Womens World</span>
                    <span className="mx-1.5 text-xs sm:text-sm text-[#F6D573]/80">•</span>
                    <span className="text-[11px] sm:text-sm text-[#F6D573] font-medium tracking-normal">Tiruvannamalai</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <ReviewSection reviews={reviews} />

      {/* ── VIDEO REELS (if configured) ── */}
      {reels?.length > 0 && (
        <div id="reels" className="scroll-mt-24">
          <ReelsSection reels={reels} />
        </div>
      )}
    </div>
  );
}
