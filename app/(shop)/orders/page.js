'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Package,
  Phone,
  Truck,
  Star,
  X,
  Loader2,
  ImagePlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  PenSquare,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

// JAI WOMENS WORLD Brand Palette
const INK = '#171717';
const INK_SOFT = '#7B5D69';
const PEACH = '#D9A441';        // Gold accent
const PEACH_LIGHT = '#F5D5DB';  // Border/soft fill
const PEACH_WASH = '#FCE4E8';   // Soft pink background
const LINE = '#F5D5DB';         // Border
const PAPER = '#FFF4F3';        // Page background
const SAGE = '#12233F';         // Deep Navy
const RUST = '#C2384F';         // Errors / Rejections
const GOLD_DARK = '#B4802A';
const FONT_SERIF = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

const STATUS_STYLES = {
  placed:    { color: INK_SOFT,  background: '#F5D5DB' },
  confirmed: { color: GOLD_DARK, background: PEACH_WASH },
  packed:    { color: GOLD_DARK, background: PEACH_WASH },
  shipped:   { color: '#FFFFFF', background: '#B02F5E' },
  delivered: { color: '#FFFFFF', background: '#12233F' },
  cancelled: { color: RUST,      background: '#FBEAE6' },
  returned:  { color: INK_SOFT,  background: '#F5D5DB' },
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// Review Submission Modal Dialog
function ReviewModal({ order, item, phone, existingReview, onClose, onSuccess }) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState(existingReview?.images || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRevising = existingReview?.status === 'rejected';

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error('You can upload up to 5 actual product photos');
      return;
    }

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image format`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB file size limit`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        const url = data.url || data.secure_url;
        if (url) urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please share your review description');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          productId: item.product,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message ||
            'Thank you for your review! Your feedback has been submitted successfully and is awaiting admin approval.',
          { duration: 5000 }
        );
        onSuccess(data.review);
      } else {
        toast.error(data.error || 'Could not submit review');
      }
    } catch {
      toast.error('Network error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeStar = hoverRating || rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white rounded-2xl border border-[#F5D5DB] p-6 sm:p-8 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F5D5DB]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-0.5">
              Verified Order Review
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#12233F]">
              {isRevising ? 'Revise Your Review' : 'Write a Review'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF4F3] hover:bg-[#FCE4E8] flex items-center justify-center text-[#7B5D69] hover:text-[#12233F] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product & Order Context */}
        <div className="mt-4 p-3 rounded-xl bg-[#FFF4F3] border border-[#F5D5DB] flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-white border border-[#F5D5DB]">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            ) : (
              <Package size={20} className="text-[#B02F5E] m-auto" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs sm:text-sm text-[#12233F] truncate">
              {item.name}
            </h4>
            <p className="text-[11px] text-[#7B5D69] flex items-center gap-2 mt-0.5">
              <span>Order #{order.orderNumber}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                <CheckCircle2 size={11} /> Delivered
              </span>
            </p>
          </div>
        </div>

        {isRevising && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>Your previous review was rejected. You can revise your rating, feedback, and photos below.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-[#12233F] mb-1.5">
              Your Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={24}
                      className={
                        star <= activeStar
                          ? 'fill-[#D9A441] text-[#D9A441]'
                          : 'text-[#E5D0D6]'
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-[#7B5D69] ml-1">
                {STAR_LABELS[activeStar] || ''}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#12233F] mb-1">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gorgeous festive color & perfect fit!"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none transition-all bg-[#FFF4F3] border border-[#F5D5DB] focus:border-[#B02F5E] focus:bg-white text-[#12233F]"
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#12233F] mb-1">
              Review Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the stitching, fabric texture, fit, and color accuracy? Tell other boutique customers!"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none transition-all bg-[#FFF4F3] border border-[#F5D5DB] focus:border-[#B02F5E] focus:bg-white text-[#12233F] leading-relaxed"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#12233F] mb-1">
              Add Actual Product Photos <span className="text-[10.5px] font-normal text-[#7B5D69]">(Optional, up to 5)</span>
            </label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {images.map((url, i) => (
                <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#F5D5DB] group/thumb shrink-0">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                    aria-label="Remove photo"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label
                  className={`w-14 h-14 rounded-lg border-2 border-dashed border-[#D9A441]/60 hover:border-[#B02F5E] bg-[#FFF4F3] flex flex-col items-center justify-center cursor-pointer transition-colors text-[#7B5D69] hover:text-[#B02F5E] shrink-0 ${
                    uploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin text-[#B02F5E]" />
                  ) : (
                    <>
                      <ImagePlus size={16} />
                      <span className="text-[9px] mt-0.5 font-medium">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Verification notice */}
          <p className="text-[11px] text-[#7B5D69] flex items-center gap-1.5 pt-1">
            <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
            <span>Your review will be verified and displayed publicly once approved by our boutique team.</span>
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F5D5DB]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-[#F5D5DB] text-[#7B5D69] hover:bg-[#FFF4F3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white transition-all shadow-boutique flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              <span>{isRevising ? 'Submit Revised Review' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map of orderId -> { [productId]: { status, rating, title, comment, images } }
  const [reviewsMap, setReviewsMap] = useState({});
  const [activeModalData, setActiveModalData] = useState(null);

  async function fetchReviewsForOrders(orderList) {
    const map = {};
    await Promise.all(
      orderList
        .filter((o) => String(o.status).toLowerCase() === 'delivered')
        .map(async (o) => {
          try {
            const res = await fetch(`/api/reviews?orderId=${o._id}`);
            const data = await res.json();
            map[o._id] = data.reviewsByProduct || {};
          } catch {}
        })
    );
    setReviewsMap(map);
  }

  async function handleLookup(e) {
    if (e) e.preventDefault();
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch('/api/orders/by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong fetching orders');
        return;
      }
      const loadedOrders = data.orders || [];
      setOrders(loadedOrders);
      fetchReviewsForOrders(loadedOrders);
    } catch {
      setError('Network error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReviewSuccess(newReview) {
    if (!activeModalData) return;
    const { order, item } = activeModalData;
    setReviewsMap((prev) => ({
      ...prev,
      [order._id]: {
        ...(prev[order._id] || {}),
        [String(item.product)]: {
          _id: newReview._id,
          status: 'pending',
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          images: newReview.images,
        },
      },
    }));
    setActiveModalData(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[65vh]">
      <div className="mb-8">
        <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-1">
          Boutique Orders
        </span>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#12233F]"
          style={{ fontFamily: FONT_SERIF }}
        >
          My Orders & Delivered Purchases
        </h1>
        <p className="text-xs sm:text-sm text-[#7B5D69] mt-1 font-light">
          Enter your 10-digit phone number to track orders and write verified reviews for delivered pieces.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Phone
            size={15}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B5D69]"
          />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none bg-white border border-[#F5D5DB] focus:border-[#B02F5E] text-[#12233F] transition-all shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-xs sm:text-sm font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg bg-[#12233F] hover:bg-[#B02F5E] text-white transition-all shadow-boutique disabled:opacity-50 shrink-0"
        >
          {loading ? 'Finding…' : 'Find Orders'}
        </button>
      </form>

      {error && (
        <p className="text-xs text-[#C2384F] mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {orders !== null && orders.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl border border-[#F5D5DB] p-8 shadow-xs">
          <Package size={32} strokeWidth={1.5} className="mx-auto mb-3 text-[#D9A441]" />
          <h3 className="font-display font-semibold text-base text-[#12233F]">No Orders Found</h3>
          <p className="text-xs text-[#7B5D69] mt-1">
            We couldn't find any orders matching phone number {phone}.
          </p>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-5 mt-6">
        {orders?.map((o) => {
          const statusKey = String(o.status || '').toLowerCase();
          const isDelivered = statusKey === 'delivered';
          const statusStyle = STATUS_STYLES[statusKey] || { color: INK_SOFT, background: '#F1EBDC' };

          return (
            <div
              key={o._id}
              className="bg-white rounded-2xl border border-[#F5D5DB] p-5 sm:p-6 shadow-card transition-shadow hover:shadow-md"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#F5D5DB]">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#12233F]">
                    Order #{o.orderNumber}
                  </span>
                  <span className="text-[11px] text-[#7B5D69] block mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span
                  className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={statusStyle}
                >
                  {o.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-[#F5D5DB]/60 my-2">
                {o.items.map((it, i) => {
                  const pId = String(it.product || '');
                  const reviewInfo = reviewsMap[o._id]?.[pId];
                  const hasReview = !!reviewInfo;
                  const reviewStatus = reviewInfo?.status; // 'pending' | 'approved' | 'rejected'

                  const variantLabel = [it.sleeveType, it.zipType, it.pantOption?.name, it.shawlOption?.name]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-[#FFF4F3] border border-[#F5D5DB]">
                          {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-[#12233F] truncate">
                            {it.name}
                          </p>
                          <p className="text-[11px] text-[#7B5D69]">
                            Qty {it.qty} {it.size ? `· Size ${it.size}` : ''} {variantLabel ? `· ${variantLabel}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Review Status & Action for Delivered Orders */}
                      {isDelivered && it.product && !it.isCombo && (
                        <div className="shrink-0 flex items-center justify-end">
                          {hasReview ? (
                            reviewStatus === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={12} /> Reviewed
                              </span>
                            ) : reviewStatus === 'rejected' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveModalData({
                                    order: o,
                                    item: it,
                                    existingReview: reviewInfo,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                              >
                                <RotateCcw size={11} /> Revise Review
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#12233F] bg-[#FFF4F3] border border-[#F5D5DB] px-2.5 py-1 rounded-full">
                                <Clock size={12} className="text-[#B02F5E]" /> Review Submitted
                              </span>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveModalData({
                                  order: o,
                                  item: it,
                                  existingReview: null,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <PenSquare size={12} />
                              <span>Write a Review</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Footer */}
              <div className="pt-3.5 border-t border-[#F5D5DB] flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#7B5D69]">
                  {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                </span>
                <span className="font-bold text-[#12233F] text-sm sm:text-base">
                  {formatINR(o.total)}
                </span>
              </div>

              {/* Courier Tracking */}
              {o.courier?.trackingId && (
                <div className="mt-3 p-2.5 rounded-lg bg-[#FFF4F3] border border-[#F5D5DB] flex items-center gap-2 text-xs text-[#7B5D69]">
                  <Truck size={14} className="text-[#D9A441] shrink-0" />
                  <span>
                    Tracked via <strong className="text-[#12233F]">{o.courier.partner}</strong>: #{o.courier.trackingId}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {activeModalData && (
        <ReviewModal
          order={activeModalData.order}
          item={activeModalData.item}
          phone={phone.replace(/\D/g, '').slice(-10)}
          existingReview={activeModalData.existingReview}
          onClose={() => setActiveModalData(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
