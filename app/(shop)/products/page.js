import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
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

const getProducts = unstable_cache(
  async (sort, page) => {
    await dbConnect();

    const query = { isActive: true };
    const sortStage = { ...SORT_MAP[sort], _id: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .select(CARD_SELECT)
        .sort(sortStage)
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      cards: JSON.parse(JSON.stringify(products)).map(toCardProduct),
      total,
    };
  },
  ['products-list'],
  { revalidate: 600, tags: ['products'] }
);

export const metadata = {
  title: "All Products | Jai Womens World",
  description: "Browse the full boutique catalogue of women's kurtis, salwar sets, and nighties from Jai Womens World, Tiruvannamalai.",
};

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;

  const sort = SORT_MAP[sp?.sort] ? sp.sort : 'newest';
  const page = Math.min(Math.max(parseInt(sp?.page, 10) || 1, 1), MAX_PAGE);

  let cards = [];
  let total = 0;
  try {
    ({ cards, total } = await getProducts(sort, page));
  } catch {}

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (n) => `/products?sort=${sort}&page=${n}`;

  return (
    <div className="bg-[#FFF4F3] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Page Header */}
        <div className="mb-10 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-[#F5D5DB] pb-8">
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
        <Filters sort={sort} />

        {/* Empty State */}
        {cards.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border border-[#F5D5DB] p-8 max-w-lg mx-auto">
            <PackageOpen size={36} className="mx-auto text-[#B02F5E]/60 mb-3" />
            <h3 className="font-display text-lg font-semibold text-[#12233F]">No products found</h3>
            <p className="text-xs text-[#7B5D69] mt-1 font-light">
              We are constantly restocking our collection. Please check back shortly or explore our featured designs.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-2.5 rounded bg-[#12233F] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#B02F5E] transition-colors"
            >
              Return to Homepage
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
