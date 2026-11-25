import { unstable_cache } from 'next/cache';
import { CARD_SELECT } from '@/lib/cardProduct';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import '@/models/Category'; // makes sure the model is registered for populate()

export function getFilter(id) {
  return mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
}

// Single source of truth for the product page AND GET /api/products/[id].
// Cached for 60s, and tagged so admin writes can bust it instantly with
// revalidateTag('products').
export const getProductPageData = unstable_cache(
  async (idOrSlug) => {
    await dbConnect();

    const product = await Product.findOne({ ...getFilter(idOrSlug), isActive: true })
      .populate('category', 'name slug sizes type sizeChart sizeChartTable')
      .lean();
    if (!product) return null;

    // Reviews and related products don't depend on each other: run in parallel
    const RELATED_LIMIT = 4;
    const catId =
      product.category?._id || (mongoose.isValidObjectId(product.category) ? product.category : null);

    const [reviews, sameCategory] = await Promise.all([
      Review.find({ product: product._id, $or: [{ status: 'approved' }, { isApproved: true }] })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      catId
        ? Product.find({
            category: catId,
            _id: { $ne: product._id },
            isActive: true,
          })
            .sort({ isBestSeller: -1, soldCount: -1, createdAt: -1 })
            .select(CARD_SELECT)
            .limit(RELATED_LIMIT)
            .lean()
        : [],
    ]);

    // Priority 1: Same category products first (up to 4)
    let related = [...sameCategory];

    // Priority 2: If there are fewer than 4 products in this category (or none),
    // fill the remaining slots with other top/popular products
    if (related.length < RELATED_LIMIT) {
      const exclude = [product._id, ...related.map((r) => r._id)];
      const fallbackQuery = { _id: { $nin: exclude }, isActive: true };
      if (product.gender) {
        fallbackQuery.gender = product.gender;
      }

      let fallback = await Product.find(fallbackQuery)
        .sort({ isBestSeller: -1, soldCount: -1, createdAt: -1 })
        .select(CARD_SELECT)
        .limit(RELATED_LIMIT - related.length)
        .lean();

      if (related.length + fallback.length < RELATED_LIMIT) {
        const stillExclude = [...exclude, ...fallback.map((f) => f._id)];
        const rest = await Product.find({ _id: { $nin: stillExclude }, isActive: true })
          .sort({ isBestSeller: -1, soldCount: -1, createdAt: -1 })
          .select(CARD_SELECT)
          .limit(RELATED_LIMIT - related.length - fallback.length)
          .lean();
        fallback = [...fallback, ...rest];
      }

      related = [...related, ...fallback];
    }

    // Strip ObjectIds/Dates so it can cross the server -> client boundary
    return JSON.parse(JSON.stringify({ product, reviews, related }));
  },
  ['product-page'],
  { revalidate: 60, tags: ['products'] }
);