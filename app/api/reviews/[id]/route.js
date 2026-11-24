import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/apiAuth';
import { recalculateProductRating } from '@/lib/recalculateRating';

export const PUT = requireAdmin(async (req, { params }) => {
  await dbConnect();
  const body = await req.json();
  const { id } = await params;

  const existing = await Review.findById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const updates = { ...body };

  // Keep status and isApproved synchronized
  if (body.status === 'approved') {
    updates.isApproved = true;
  } else if (body.status === 'rejected') {
    updates.isApproved = false;
  } else if (body.status === 'pending') {
    updates.isApproved = false;
  } else if (body.isApproved === true) {
    updates.status = 'approved';
  } else if (body.isApproved === false && updates.status !== 'pending') {
    updates.status = 'rejected';
  }

  const review = await Review.findByIdAndUpdate(id, updates, { new: true });

  // Recalculate dynamic rating and review count from all approved reviews
  const stats = await recalculateProductRating(review.product);

  return NextResponse.json({ review, stats });
});

export const DELETE = requireAdmin(async (req, { params }) => {
  await dbConnect();
  const { id } = await params;

  const existing = await Review.findById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const productId = existing.product;
  await Review.findByIdAndDelete(id);

  // Recalculate dynamic rating and review count after deletion
  const stats = await recalculateProductRating(productId);

  return NextResponse.json({ success: true, stats });
});
