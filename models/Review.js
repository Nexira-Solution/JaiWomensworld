import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    orderItemId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    title: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, default: '' },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ order: 1, product: 1 });
ReviewSchema.index({ isApproved: 1, createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
