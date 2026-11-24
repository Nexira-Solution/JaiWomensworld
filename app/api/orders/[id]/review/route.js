import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';

// POST /api/orders/:id/review -> customer rates one product from their own delivered order
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const { phone, productId, rating, title, comment, images } = body;

  if (!phone || !productId || !rating) {
    return NextResponse.json({ error: 'Phone, product and rating are required' }, { status: 400 });
  }

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return NextResponse.json({ error: 'Review description is required' }, { status: 400 });
  }

  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // verify the phone actually matches this order
  const cleanedInput = String(phone).replace(/\D/g, '').slice(-10);
  const cleanedOrder = String(order.customer?.phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanedInput || cleanedInput !== cleanedOrder) {
    return NextResponse.json({ error: 'Phone number does not match this order' }, { status: 403 });
  }

  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'You can only review items after delivery' }, { status: 400 });
  }

  const item = order.items.find((it) => it.product && String(it.product) === String(productId));
  if (!item) {
    return NextResponse.json({ error: 'This product is not part of your order' }, { status: 400 });
  }

  const existing = await Review.findOne({ order: order._id, product: productId });
  if (existing) {
    return NextResponse.json({ error: 'You already reviewed this product' }, { status: 400 });
  }

  const review = await Review.create({
    product: productId,
    order: order._id,
    customerName: order.customer?.name || 'Verified Customer',
    customerPhone: order.customer?.phone || '',
    customerEmail: order.customer?.email || '',
    rating: Number(rating),
    title: (title || '').trim(),
    comment: comment.trim(),
    images: Array.isArray(images) ? images : [],
    status: 'pending',
    isApproved: false,
    isVerifiedPurchase: true,
  });

  return NextResponse.json(
    {
      review,
      message:
        'Thank you for your review! Your review has been submitted successfully and is awaiting admin approval.',
    },
    { status: 201 }
  );
}
