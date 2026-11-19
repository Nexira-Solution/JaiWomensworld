import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import ProductCard from '@/components/ProductCard';
import CategoryFilters from '@/components/CategoryFilters';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { toCardProduct } from '@/lib/cardProduct';
import { ChevronRight, Sparkles, ArrowLeft, ArrowRight, PackageOpen } from 'lucide-react';

const PAGE_SIZE = 24;
const MAX_PAGE = 100;

const SORT_MAP = {
  newest: { createdAt: -1 },
  priceLow: { basePrice: 1 },
  priceHigh: { basePrice: -1 },
  popular: { soldCount: -1 },
  rating: { rating: -1 },
};

const FLAG_QUERY = {
  bestseller: { isBestSeller: true },
  topseller: { isTopSeller: true },
  newarrival: { isActiveSeller: true },
};

function flagToSortValue(flag) {
  if (flag === 'bestseller') return 'bestselling';
  if (flag === 'newarrival') return 'newarrival';
  return 'newest';
}

function sortToApiSort(sort) {
  if (sort === 'newarrival') return 'newest';
  if (sort === 'bestselling') return 'popular';
  return SORT_MAP[sort] ? sort : 'newest';
}

const getCategoryPageData = unstable_cache(
  async (slug, apiSort, flag, page) => {
    await dbConnect();

    const category = await Category.findOne({ slug, isActive: true })
      .populate('parent', 'name slug')
      .lean();
    if (!category) return null;

    const subs = await Category.find({ parent: category._id, isActive: true })
      .select('name slug image')
      .lean();

    const categoryIds = [category._id, ...subs.map((s) => s._id)];
    const query = {
      isActive: true,
      category: { $in: categoryIds },
      ...(FLAG_QUERY[flag] || {}),
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .select({ slug: 1, name: 1, basePrice: 1, variants: { $slice: 1 } })
        .sort({ ...SORT_MAP[apiSort], _id: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(query),
    ]);

    const plain = JSON.parse(JSON.stringify({ category, subs, products }));
    return {
      category: {
        name: plain.category.name,
        slug: plain.category.slug,
        image: plain.category.image || null,
        description: plain.category.description || '',
        parent: plain.category.parent
          ? { name: plain.category.parent.name, slug: plain.category.parent.slug }
          : null,
      },
      subcategories: plain.subs,
      cards: plain.products.map(toCardProduct),
      total,
    };
  },
  ['category-page'],
  { revalidate: 600, tags: ['products', 'categories'] }
);

function parseParams(sp) {
  const flag = FLAG_QUERY[sp?.flag] ? sp.flag : null;
  const sortValue = SORT_MAP[sp?.sort] ? sp.sort : flagToSortValue(flag);
  const page = Math.min(Math.max(parseInt(sp?.page, 10) || 1, 1), MAX_PAGE);
  return { flag, sortValue, apiSort: sortToApiSort(sortValue), page };
}

function buildHeading(flag, name) {
  const suffix = name ? ` in ${name}` : '';
  if (flag === 'bestseller') return `Best Sellers${suffix}`;
  if (flag === 'topseller') return `Top Sellers${suffix}`;
  if (flag === 'newarrival') return `New Arrivals${suffix}`;
  return name || 'Collection';
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const { flag, apiSort, page } = parseParams(sp);
  try {
    const data = await getCategoryPageData(slug, apiSort, flag, page);
    if (!data) return {};
    return {
      title: `${buildHeading(flag, data.category.name)} | Jai Womens World`,
      description:
        data.category.description ||
        `Shop elegant ${data.category.name} from Jai Womens World boutique, Tiruvannamalai. Quality fabrics, stylish silhouettes, and fast shipping.`,
    };
  } catch {
    return {
      title: 'Collection | Jai Womens World',
    };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const { flag, sortValue, apiSort, page } = parseParams(sp);

  let data = null;
  try {
    data = await getCategoryPageData(slug, apiSort, flag, page);
  } catch (err) {
    console.error('Error loading category page:', err?.message || err);
  }
  if (!data) notFound();

  const { category, subcategories, cards, total } = data;
  const heading = buildHeading(flag, category.name);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  function pageHref(n) {
    const qs = new URLSearchParams();
    if (flag) qs.set('flag', flag);
    if (SORT_MAP[sp?.sort] && sp.sort !== 'newest') qs.set('sort', sp.sort);
    qs.set('page', String(n));
    return `/category/${slug}?${qs.toString()}`;
  }

  return (
    <div className="bg-[#F5F0E9] min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#77716F] mb-6 font-light">
          <Link href="/" className="hover:text-[#172333] transition-colors">Home</Link>
          <ChevronRight size={12} className="text-[#E9DFD9]" />
          <Link href="/products" className="hover:text-[#172333] transition-colors">Collections</Link>
          {category.parent && (
            <>
              <ChevronRight size={12} className="text-[#E9DFD9]" />
              <Link href={`/category/${category.parent.slug}`} className="hover:text-[#172333] transition-colors">
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="text-[#E9DFD9]" />
          <span className="text-[#172333] font-medium">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="mb-10 p-6 sm:p-10 rounded-xl bg-white border border-[#E9DFD9] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B98270]">
              <Sparkles size={12} className="text-[#BFA078]" />
              Boutique Collection
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#172333] tracking-tight">
              {heading}
            </h1>
            <p className="text-xs sm:text-sm text-[#77716F] font-light leading-relaxed">
              {category.description ||
                `Discover our exclusive range of ${category.name}, designed with high-grade fabrics, beautiful drapes, and modern sensibilities.`}
            </p>
          </div>

          <div className="text-xs text-[#77716F] bg-[#F5F0E9] px-4 py-2 rounded-full border border-[#E9DFD9] shrink-0 self-start md:self-center">
            <strong className="text-[#172333] font-semibold">{total}</strong> {total === 1 ? 'Design' : 'Designs'} Available
          </div>
        </div>

        {/* Subcategories (if any) */}
        {subcategories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs uppercase tracking-widest text-[#77716F] font-medium mb-3">
              Explore Subcategories
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/category/${sub.slug}`}
                  prefetch={false}
                  className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-[#E9DFD9] hover:border-[#B98270] transition-all group"
                >
                  {sub.image && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F4E8E3] shrink-0">
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#172333] group-hover:text-[#B98270] transition-colors">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <CategoryFilters sort={sortValue} />

        {/* Products Grid */}
        {cards.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border border-[#E9DFD9] p-8 max-w-lg mx-auto">
            <PackageOpen size={36} className="mx-auto text-[#B98270]/60 mb-3" />
            <h3 className="font-display text-lg font-semibold text-[#172333]">No products in this category yet</h3>
            <p className="text-xs text-[#77716F] mt-1 font-light">
              We are adding new stock to this section weekly. Explore other collections in the meantime.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block px-6 py-2.5 rounded bg-[#172333] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#B98270] transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        ) : (
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-white border border-[#E9DFD9] text-[#172333] hover:border-[#B98270] hover:text-[#B98270] transition-colors shadow-xs"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#E9DFD9]/40 border border-transparent text-[#77716F]/40 cursor-not-allowed">
                <ArrowLeft size={13} />
                <span>Previous</span>
              </span>
            )}

            <span className="text-xs text-[#77716F] px-3 font-normal">
              Page {page} of {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                prefetch={false}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-white border border-[#E9DFD9] text-[#172333] hover:border-[#B98270] hover:text-[#B98270] transition-colors shadow-xs"
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#E9DFD9]/40 border border-transparent text-[#77716F]/40 cursor-not-allowed">
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
