import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function recalculateProductRating(productId) {
  if (!productId) return { rating: 0, reviewCount: 0 };
  await dbConnect();

  // Find all approved reviews for this product
  const approved = await Review.find({
    product: productId,
    $or: [{ status: 'approved' }, { isApproved: true }],
  }).lean();

  let rating = 0;
  const reviewCount = approved.length;

  if (reviewCount > 0) {
    const totalRating = approved.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    rating = Math.round((totalRating / reviewCount) * 10) / 10;
  }

  await Product.findByIdAndUpdate(productId, { rating, reviewCount });

  try {
    revalidateTag('products');
    revalidatePath('/products');
    revalidatePath('/');
  } catch {}

  return { rating, reviewCount };
}
