import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/apiAuth';
import { recalculateProductRating } from '@/lib/recalculateRating';

// POST /api/reviews/admin -> admin creates a review directly
export const POST = requireAdmin(async (req) => {
  await dbConnect();
  const body = await req.json();
  const { product, customerName, title, rating, comment, images, isFeatured } = body;

  if (!product || !customerName || !rating) {
    return NextResponse.json({ error: 'Product, name and rating are required' }, { status: 400 });
  }

  const review = await Review.create({
    product,
    customerName,
    title: (title || '').trim(),
    rating: Number(rating),
    comment: (comment || '').trim(),
    images: Array.isArray(images) ? images : [],
    isFeatured: !!isFeatured,
    status: 'approved',
    isApproved: true,
    isVerifiedPurchase: false,
  });

  const stats = await recalculateProductRating(product);

  return NextResponse.json({ review, stats }, { status: 201 });
});
