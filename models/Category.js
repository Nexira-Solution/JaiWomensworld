import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    sizes: [{ type: String }], // available size options for filter, e.g. S,M,L,XL,XXL

    // One or more fallback size chart images, shown as a gallery on the
    // storefront for any product in this category that has no size chart
    // of its own.
    sizeChart: [{ type: String }],

    // Optional structured size chart table rows from backend
    sizeChartTable: [
      {
        size: { type: String },
        chest: { type: String, default: '' },
        bust: { type: String, default: '' },
        waist: { type: String, default: '' },
        hip: { type: String, default: '' },
        length: { type: String, default: '' },
        shoulder: { type: String, default: '' }
      }
    ],

    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);