import { dbConnect } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Combo from '@/models/Combo';
import Category from '@/models/Category';
import BannerCarousel from '@/components/BannerCarousel';
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

export const revalidate = 600;

const FEATURED_LIMIT = 8;
const REELS_LIMIT = 10;

// Curated Category Imagery Fallbacks for Jai Womens World
const CATEGORY_IMAGES = {
  'salwar-set': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'rayon-umbrella-kurtis': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'side-open-kurtis': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  'umbrella-kurtis': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
  'nighties': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  'innerwear': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  '2-piece-set': 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
};

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

const SAMPLE_COMBOS = [
  {
    _id: 'sample-combo-1',
    name: '3x Rayon Umbrella Kurtis Value Pack',
    slug: '3x-rayon-umbrella-kurtis-value-pack',
    comboPrice: 1999,
    originalPrice: 2899,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    description: 'Pick any 3 colours from our best-selling umbrella rayon kurti range at a special boutique bundle price.',
  },
  {
    _id: 'sample-combo-2',
    name: 'Comfort Sleep Set — 4 Cotton Nighties',
    slug: 'comfort-sleep-set-4-cotton-nighties',
    comboPrice: 1399,
    originalPrice: 2200,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
    description: 'Ultra-soft 100% breathable cotton daily nighties. Color variety pack with durable seams and roomy fit.',
  },
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
      Review.find({ isApproved: true, isFeatured: true }).populate('product', 'name').limit(10).lean(),
      Combo.find({ isActive: true }).limit(6).lean(),
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
  const displayProducts = dbArrivals && dbArrivals.length > 0 ? dbArrivals : SAMPLE_PRODUCTS;
  const displayCombos = dbCombos && dbCombos.length > 0 ? dbCombos : SAMPLE_COMBOS;

  return (
    <div className="overflow-x-hidden bg-[#F5F0E9]">
      
      {/* Editorial Banner / Hero Section — Dynamic from DB with Editorial Fallback */}
      <BannerCarousel banners={banners} />

      {/* ── SECTION: SHOP BY CATEGORY (Editorial Grid Layout) ── */}
      {plainCategories?.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B98270] mb-2">
              Explore Your Style
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#172333]">
              Find Your Signature Look
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="w-8 h-px bg-[#E9DFD9]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA078]" />
              <span className="w-8 h-px bg-[#E9DFD9]" />
            </div>
            <p className="text-xs sm:text-sm text-[#77716F] font-light max-w-md mt-3">
              Explore thoughtfully selected styles and discover fashion that feels uniquely yours.
            </p>
          </div>

          {/* Asymmetric / Responsive Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {plainCategories.map((c, idx) => {
              const isLarge = idx === 0 && plainCategories.length >= 4;
              const categoryImage = c.image || CATEGORY_IMAGES[c.slug] || '/placeholder.png';

              return (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  className={`group relative overflow-hidden rounded-lg border border-[#E9DFD9] bg-white transition-all duration-300 hover:border-[#D8B5A9] hover:shadow-card flex flex-col ${
                    isLarge ? 'md:col-span-2 md:row-span-1' : ''
                  }`}
                >
                  <div className={`relative w-full ${isLarge ? 'aspect-[16/10] md:aspect-[2/1]' : 'aspect-[4/5]'} overflow-hidden bg-[#F4E8E3]/60`}>
                    <img
                      src={categoryImage}
                      alt={`Women's ${c.name} collection at Jai Womens World`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                    {/* Card Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#D8B5A9] font-medium block">
                          Category
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-semibold text-white">
                          {c.name}
                        </h3>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#172333] group-hover:bg-[#B98270] group-hover:text-white transition-colors shrink-0 shadow-sm">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SECTION: FEATURED COLLECTION ("THE JAI EDIT") ── */}
      <section className="py-20 bg-white border-t border-[#E9DFD9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B98270] mb-2">
              The Curated Edit
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#172333]">
              Discover Our Curated Collection
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="w-8 h-px bg-[#E9DFD9]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA078]" />
              <span className="w-8 h-px bg-[#E9DFD9]" />
            </div>
            <p className="text-xs sm:text-sm text-[#77716F] font-light max-w-md mt-3">
              Explore our handpicked selection of women&rsquo;s boutique designs, thoughtfully brought together to complement your style.
            </p>
          </div>

          {/* Product Grid: 4 columns on desktop, 3 on tablet, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayProducts.map((p, i) => (
              <ProductCard key={p._id} product={toCardProduct(p)} priority={i < 4} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#172333] hover:bg-[#B98270] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique group"
            >
              <span>Explore All Kurtis &amp; Collections</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION: COMBO OFFERS (BEAUTIFULLY PAIRED) ── */}
      {displayCombos?.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-[#F5F0E9] via-[#F4E8E3]/50 to-[#F5F0E9] border-t border-[#E9DFD9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B98270] mb-2">
                Beautifully Paired
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#172333]">
                Boutique Combo Sets
              </h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="w-8 h-px bg-[#E9DFD9]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#BFA078]" />
                <span className="w-8 h-px bg-[#E9DFD9]" />
              </div>
              <p className="text-xs sm:text-sm text-[#77716F] font-light max-w-md mt-3">
                Discover thoughtfully selected combinations and explore special value offers from our collection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCombos.map((c) => {
                const isColorPack = c.type === 'color-pack';
                const cheapestPack = isColorPack && c.packOptions?.length
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
                    className="group bg-white rounded-lg overflow-hidden border border-[#E9DFD9] hover:border-[#D8B5A9] hover:shadow-card transition-all flex flex-col"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F4E8E3]">
                      {cover ? (
                        <img
                          src={cover}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#77716F]">
                          Boutique Combo
                        </div>
                      )}

                      {savings > 0 && (
                        <span className="absolute top-3 left-3 bg-[#172333] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                          Save {formatINR(savings)}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#B98270] font-semibold block mb-1">
                          Special Pack
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-semibold text-[#172333] group-hover:text-[#B98270] transition-colors">
                          {c.name}
                        </h3>
                        {c.description && (
                          <p className="text-xs text-[#77716F] font-light mt-1.5 line-clamp-2">
                            {c.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#E9DFD9] flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-semibold text-[#172333]">
                            {formatINR(displayPrice)}
                          </span>
                          {originalPrice > displayPrice && (
                            <span className="text-xs text-[#77716F] line-through font-light">
                              {formatINR(originalPrice)}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-[#B98270] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>View Pack</span>
                          <ArrowRight size={12} />
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

      {/* ── SECTION: BOUTIQUE CRAFTSMANSHIP & STORY ── */}
      <section className="py-20 bg-white border-t border-[#E9DFD9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B98270]">
                Tiruvannamalai Boutique
              </span>

              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#172333] leading-tight">
                Crafted With Devotion, Designed for Modern Grace
              </h2>

              <p className="text-sm leading-relaxed text-[#77716F] font-light">
                At Jai Womens World, every garment is thoughtfully selected to honor tradition while celebrating contemporary womanhood. From breezy daily cottons to graceful rayon umbrella flares and festive salwar suits, we bring you style that feels like home.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-[#F5F0E9] border border-[#E9DFD9]">
                  <ShieldCheck size={20} className="text-[#BFA078] mb-2" />
                  <h4 className="font-semibold text-xs text-[#172333]">Direct Quality</h4>
                  <p className="text-[11px] text-[#77716F] mt-1 font-light">Hand-inspected stitches &amp; fine fabrics.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F0E9] border border-[#E9DFD9]">
                  <Truck size={20} className="text-[#B98270] mb-2" />
                  <h4 className="font-semibold text-xs text-[#172333]">Pan-India Shipping</h4>
                  <p className="text-[11px] text-[#77716F] mt-1 font-light">Reliable couriers delivered to your door.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F0E9] border border-[#E9DFD9]">
                  <HeartHandshake size={20} className="text-[#BFA078] mb-2" />
                  <h4 className="font-semibold text-xs text-[#172333]">Boutique Care</h4>
                  <p className="text-[11px] text-[#77716F] mt-1 font-light">Dedicated WhatsApp support for sizing.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#B98270] hover:text-[#172333] transition-colors"
                >
                  <span>Learn More About Our Journey</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden border border-[#E9DFD9] shadow-boutique bg-[#F5F0E9]">
                <Image
                  src="/Jai-logo.jpeg"
                  alt="Jai Womens World Tiruvannamalai"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#172333]/90 to-transparent text-white flex items-center justify-between">
                  <div>
                    <span className="font-display text-base font-semibold block">JAI WOMENS WORLD</span>
                    <span className="text-[10px] text-[#D8B5A9] uppercase tracking-widest">Tiruvannamalai, Tamil Nadu</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-[#BFA078] text-[#172333] font-semibold">
                    Est. Quality
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS SECTION ── */}
      <ReviewSection reviews={reviews} />

      {/* ── VIDEO REELS SHOWCASE (if configured) ── */}
      {reels?.length > 0 && <ReelsSection reels={reels} />}

    </div>
  );
}
