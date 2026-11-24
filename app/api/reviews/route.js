export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/apiAuth';

// GET /api/reviews
// - ?productId=<id>    -> public: approved reviews for this product
// - ?featured=true     -> public: approved + featured reviews
// - ?orderId=<id>      -> which products on this order have a review
// - ?all=true          -> admin: all reviews (supports ?status=pending|approved|rejected)
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const featured = searchParams.get('featured');
  const all = searchParams.get('all');
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  if (orderId) {
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ reviewedProductIds: [] });
    }
    const reviews = await Review.find({ order: orderId }).select('product');
    return NextResponse.json({ reviewedProductIds: reviews.map((r) => String(r.product)) });
  }

  // Admin view
  if (all === 'true') {
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate('product', 'name slug basePrice variants')
      .populate('order', 'orderNumber customer status')
      .limit(200)
      .lean();
    return NextResponse.json({ reviews });
  }

  // Public view: ONLY approved reviews
  const query = {
    $or: [{ status: 'approved' }, { isApproved: true }],
  };

  if (productId && mongoose.isValidObjectId(productId)) {
    query.product = productId;
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .populate('product', 'name slug')
    .limit(50)
    .lean();

  return NextResponse.json({ reviews });
}

// POST /api/reviews
// Customer review submission with verified delivered order validation
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const {
      product: productId,
      order: orderIdInput,
      orderNumber,
      phone,
      rating,
      title,
      comment,
      images,
      customerName,
      customerAvatar,
    } = body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: 'A valid product is required' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json({ error: 'Review description is required' }, { status: 400 });
    }

    // Verify customer's delivered order
    let matchedOrder = null;

    if (orderIdInput && mongoose.isValidObjectId(orderIdInput)) {
      matchedOrder = await Order.findById(orderIdInput);
    } else if (orderNumber) {
      matchedOrder = await Order.findOne({ orderNumber: String(orderNumber).trim() });
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        matchedOrder = await Order.findOne({
          status: 'delivered',
          'customer.phone': new RegExp(`${cleanPhone}$`),
          'items.product': productId,
        }).sort({ createdAt: -1 });
      }
    }

    if (!matchedOrder) {
      return NextResponse.json(
        {
          error:
            'We could not find a delivered purchase for this product. Reviews are only allowed for delivered orders.',
        },
        { status: 403 }
      );
    }

    // Verify order status is strictly 'delivered'
    if (matchedOrder.status !== 'delivered') {
      return NextResponse.json(
        { error: 'You can only review products after your order has been successfully delivered.' },
        { status: 400 }
      );
    }

    // Verify the product is actually in the order items
    const hasProduct = (matchedOrder.items || []).some(
      (it) => it.product && String(it.product) === String(productId)
    );
    if (!hasProduct) {
      return NextResponse.json(
        { error: 'This product was not found in your delivered order.' },
        { status: 400 }
      );
    }

    // Prevent duplicate reviews for the same order and product
    const existing = await Review.findOne({
      order: matchedOrder._id,
      product: productId,
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this product from this order.' },
        { status: 400 }
      );
    }

    const finalCustomerName = (
      customerName ||
      matchedOrder.customer?.name ||
      'Verified Customer'
    ).trim();

    // Create review in pending status
    const review = await Review.create({
      product: productId,
      order: matchedOrder._id,
      customerName: finalCustomerName,
      customerEmail: matchedOrder.customer?.email || '',
      customerPhone: matchedOrder.customer?.phone || '',
      customerAvatar: customerAvatar || '',
      rating: numRating,
      title: (title || '').trim(),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.filter((img) => typeof img === 'string') : [],
      status: 'pending',
      isApproved: false,
      isVerifiedPurchase: true,
      isFeatured: false,
    });

    return NextResponse.json(
      {
        review,
        message:
          'Thank you for your review! Your review has been submitted successfully and is awaiting admin approval.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error submitting review:', err);
    return NextResponse.json(
      { error: err?.message || 'Could not submit review. Please try again.' },
      { status: 500 }
    );
  }
}
