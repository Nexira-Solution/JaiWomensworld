export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';

// POST /api/reviews/eligibility
// Body: { productId, phone?, orderNumber? }
export async function POST(req) {
  try {
    await dbConnect();
    const { productId, phone, orderNumber } = await req.json();

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ eligible: false, message: 'Invalid product' }, { status: 400 });
    }

    if (!phone && !orderNumber) {
      return NextResponse.json(
        { eligible: false, message: 'Phone number or order number is required' },
        { status: 400 }
      );
    }

    const query = {
      status: 'delivered',
      'items.product': productId,
    };

    if (orderNumber) {
      query.orderNumber = String(orderNumber).trim();
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          { eligible: false, message: 'Please enter a valid 10-digit phone number' },
          { status: 400 }
        );
      }
      query['customer.phone'] = new RegExp(`${cleanPhone}$`);
    }

    // Find the latest matching delivered order containing this product
    const deliveredOrder = await Order.findOne(query).sort({ createdAt: -1 });

    if (!deliveredOrder) {
      // Check if there was an order that is not delivered yet
      const nonDeliveredQuery = {
        'items.product': productId,
      };
      if (orderNumber) nonDeliveredQuery.orderNumber = String(orderNumber).trim();
      else {
        const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
        nonDeliveredQuery['customer.phone'] = new RegExp(`${cleanPhone}$`);
      }
      const existingOrder = await Order.findOne(nonDeliveredQuery);

      if (existingOrder) {
        return NextResponse.json({
          eligible: false,
          message: `Your order #${existingOrder.orderNumber} is currently "${existingOrder.status}". Reviews can only be submitted once the order has been delivered.`,
        });
      }

      return NextResponse.json({
        eligible: false,
        message: 'No purchase of this product was found matching your details.',
      });
    }

    // Check if a review already exists for this order item
    const existingReview = await Review.findOne({
      order: deliveredOrder._id,
      product: productId,
    });

    if (existingReview) {
      return NextResponse.json({
        eligible: false,
        alreadyReviewed: true,
        message: `You have already submitted a review for this product from order #${deliveredOrder.orderNumber}.`,
      });
    }

    return NextResponse.json({
      eligible: true,
      orderId: deliveredOrder._id,
      orderNumber: deliveredOrder.orderNumber,
      customerName: deliveredOrder.customer?.name || '',
      customerEmail: deliveredOrder.customer?.email || '',
      customerPhone: deliveredOrder.customer?.phone || '',
    });
  } catch (err) {
    console.error('Eligibility check error:', err);
    return NextResponse.json(
      { eligible: false, message: 'Could not verify order eligibility' },
      { status: 500 }
    );
  }
}
