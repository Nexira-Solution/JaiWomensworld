export const dynamic = 'force-dynamic';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { toCardProduct, CARD_SELECT } from '@/lib/cardProduct';
import { Sparkles, ArrowLeft, ArrowRight, PackageOpen } from 'lucide-react';

const PAGE_SIZE = 24;
const MAX_PAGE = 100;

const SORT_MAP = {
  newest: { createdAt: -1 },
  priceLow: { basePrice: 1 },
  priceHigh: { basePrice: -1 },
  popular: { soldCount: -1 },
  rating: { rating: -1 },
};

export const metadata = {
  title: "All Products | Jai Womens World",
  description: "Browse the full boutique catalogue of women's kurtis, salwar sets, and nighties from Jai Womens World, Tiruvannamalai.",
};

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;

  const category = sp?.category || 'all';
  const arrival = sp?.arrival || 'all';
  const sort = SORT_MAP[sp?.sort] ? sp.sort : 'newest';
  const page = Math.min(Math.max(parseInt(sp?.page, 10) || 1, 1), MAX_PAGE);

  await dbConnect();

  // 1. Fetch active categories for the category filter
  let plainCategories = [];
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug _id')
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    plainCategories = JSON.parse(JSON.stringify(categories || []));
  } catch (err) {
    console.error('Error fetching categories for filter:', err?.message || err);
  }

  // 2. Build MongoDB query from filters (strictly Women's boutique items only)
  const query = {
    isActive: true,
    gender: { $nin: ['Men', 'Kids', 'men', 'kids'] },
  };
  const andConditions = [];

  // A. Category Filter
  if (category && category !== 'all') {
    const selectedCat = plainCategories.find(
      (c) => c.slug === category || String(c._id) === category
    );
    if (selectedCat) {
      query.category = selectedCat._id;
    }
  }

  // B. Arrival Filter (New Arrivals)
  if (arrival === 'new') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    andConditions.push({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: ninetyDaysAgo } },
        { isFeatured: true },
        { isTopSeller: true },
        { isBestSeller: true },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // D. Price Sorting
  const sortStage = { ...SORT_MAP[sort], _id: -1 };

  let cards = [];
  let total = 0;
  try {
    const [products, count] = await Promise.all([
      Product.find(query)
        .select(CARD_SELECT)
        .sort(sortStage)
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(query),
    ]);

    cards = JSON.parse(JSON.stringify(products || [])).map(toCardProduct);
    total = count;
  } catch (err) {
    console.error('Error fetching filtered products:', err?.message || err);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (n) => {
    const p = new URLSearchParams();
    if (category && category !== 'all') p.set('category', category);
    if (arrival && arrival !== 'all') p.set('arrival', arrival);
    if (sort && sort !== 'newest') p.set('sort', sort);
    if (n > 1) p.set('page', String(n));
    const qs = p.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="bg-[#FFF4F3] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Page Header */}
        <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-[#F5D5DB] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B02F5E] mb-2">
              <Sparkles size={12} className="text-[#D9A441]" />
              The Full Boutique Edit
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#12233F] tracking-tight">
              All Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#7B5D69] font-light max-w-xl mt-2 leading-relaxed">
              Explore our complete selection of women&rsquo;s kurtis, salwar sets, and everyday essentials crafted with premium comfort and timeless style.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-xs text-[#7B5D69] bg-white px-3.5 py-1.5 rounded-full border border-[#F5D5DB] shrink-0 self-start sm:self-end">
            Showing <strong className="text-[#12233F] font-semibold">{total}</strong> {total === 1 ? 'Design' : 'Designs'}
          </div>
        </div>

        {/* Filters / Sort Bar */}
        <Filters
          categories={plainCategories}
          currentCategory={category}
          currentArrival={arrival}
          currentSort={sort}
          total={total}
        />

        {/* Empty State */}
        {cards.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border border-[#F5D5DB] p-8 max-w-lg mx-auto">
            <PackageOpen size={36} className="mx-auto text-[#B02F5E]/60 mb-3" />
            <h3 className="font-display text-lg font-semibold text-[#12233F]">No products match these filters</h3>
            <p className="text-xs text-[#7B5D69] mt-1 font-light">
              Try adjusting your category or arrival filters, or clear all filters to see everything.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block px-6 py-2.5 rounded bg-[#12233F] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#B02F5E] transition-colors"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          /* Product Grid: 4 columns on large, 3 on tablet, 2 on mobile */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {cards.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={page === 1 && i < 4} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-4 text-xs font-medium uppercase tracking-wider" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                prefetch={false}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-white border border-[#F5D5DB] text-[#12233F] hover:border-[#B02F5E] hover:text-[#B02F5E] transition-colors shadow-xs"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#F5D5DB]/40 border border-transparent text-[#7B5D69]/40 cursor-not-allowed">
                <ArrowLeft size={13} />
                <span>Previous</span>
              </span>
            )}

            <span className="text-xs text-[#7B5D69] px-3 font-normal">
              Page {page} of {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                prefetch={false}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-white border border-[#F5D5DB] text-[#12233F] hover:border-[#B02F5E] hover:text-[#B02F5E] transition-colors shadow-xs"
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#F5D5DB]/40 border border-transparent text-[#7B5D69]/40 cursor-not-allowed">
                <span>Next</span>
                <ArrowRight size={13} />
              </span>
            )}
          </nav>
        )}

      </div>
    </div>
  );
}
