'use client';

import { useState, useId } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Star,
  Check,
  X,
  Upload,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  PenSquare,
  Sparkles,
  Camera,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ProductReviewsSection({ product, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Form states
  const [step, setStep] = useState(1); // 1 = verification, 2 = review form, 3 = success
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedData, setVerifiedData] = useState(null);

  // Review fields
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const approvedCount = reviews.length;
  const avgRating =
    approvedCount > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / approvedCount
        ).toFixed(1)
      : null;

  const productImg =
    product.variants?.[0]?.images?.[0] || product.image || '/placeholder.png';

  function openModal() {
    setStep(1);
    setVerifyError('');
    setPhone('');
    setOrderNumber('');
    setVerifiedData(null);
    setRating(5);
    setTitle('');
    setComment('');
    setImages([]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  // Step 1: Verify eligibility
  async function handleVerify(e) {
    e.preventDefault();
    setVerifyError('');
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone && !orderNumber.trim()) {
      setVerifyError('Please enter your 10-digit phone number or Order ID');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/reviews/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          phone: cleanPhone || undefined,
          orderNumber: orderNumber.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.eligible) {
        setVerifyError(
          data.message || 'Could not verify a delivered order for this product.'
        );
        return;
      }

      setVerifiedData(data);
      setStep(2);
    } catch {
      setVerifyError('Network error checking order eligibility. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  // Upload review photos
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      toast.error('You can upload up to 5 photos');
      return;
    }

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
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
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  // Step 2: Submit Review
  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please share your review description');
      return;
    }
    if (!verifiedData?.orderId) {
      toast.error('Order verification expired. Please verify again.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product._id,
          order: verifiedData.orderId,
          orderNumber: verifiedData.orderNumber,
          customerName: verifiedData.customerName || 'Verified Customer',
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not submit review');
        return;
      }

      setStep(3); // success view
    } catch {
      toast.error('Network error submitting review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 sm:mt-24 border-t border-[#F5D5DB] pt-12 sm:pt-16">
      {/* Section Header & Rating Summary */}
      <div className="bg-white rounded-2xl border border-[#F5D5DB] p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F5D5DB]">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-1">
              Verified Feedback
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#12233F]">
              Customer Reviews
            </h2>
            <p className="text-xs sm:text-sm text-[#7B5D69] mt-1 font-light">
              Real opinions and experiences from customers who ordered this item.
            </p>
          </div>

          <button
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-boutique self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
          >
            <PenSquare size={14} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Breakdown Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
          {approvedCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-center sm:text-left">
                <span className="font-display text-4xl sm:text-5xl font-bold text-[#12233F]">
                  {avgRating}
                </span>
                <span className="text-xs text-[#7B5D69] ml-1">/ 5</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(Number(avgRating))
                          ? 'fill-[#D9A441] text-[#D9A441]'
                          : 'text-[#F5D5DB]'
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-[#7B5D69]">
                  Based on {approvedCount} {approvedCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[#7B5D69]">
              <div className="w-10 h-10 rounded-full bg-[#FFF4F3] border border-[#F5D5DB] flex items-center justify-center text-[#B02F5E]">
                <Star size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#12233F]">No ratings yet</p>
                <p className="text-xs text-[#7B5D69]">
                  0 reviews. Be the first to review once your order is delivered!
                </p>
              </div>
            </div>
          )}

          <div className="hidden sm:block h-10 w-px bg-[#F5D5DB]" />

          <div className="flex items-center gap-2 text-xs text-[#7B5D69]">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>Reviews are verified exclusively from delivered customer purchases.</span>
          </div>
        </div>
      </div>

      {/* Reviews Cards Grid */}
      <div className="mt-8">
        {reviews.length === 0 ? (
          <div className="bg-[#FFF4F3] rounded-xl border border-dashed border-[#F5D5DB] p-10 text-center">
            <ShoppingBag size={28} className="mx-auto text-[#B02F5E] mb-3 stroke-[1.5]" />
            <h3 className="font-display font-semibold text-base text-[#12233F]">
              No Approved Reviews Yet
            </h3>
            <p className="text-xs text-[#7B5D69] max-w-md mx-auto mt-1 leading-relaxed">
              Have you received this product? Verify your delivered order and share your honest feedback with our community.
            </p>
            <button
              onClick={openModal}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B02F5E] hover:text-[#12233F] transition-colors"
            >
              <span>Verify & submit review</span> &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => {
              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-xl border border-[#F5D5DB] p-5 sm:p-6 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Review Header: User & Verified Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {r.customerAvatar ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#F5D5DB]">
                            <Image
                              src={r.customerAvatar}
                              alt={r.customerName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12233F] to-[#B02F5E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                            {r.customerName?.[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-[#12233F]">
                              {r.customerName}
                            </span>
                            {r.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check size={10} strokeWidth={2.5} /> Verified Buyer
                              </span>
                            )}
                          </div>
                          {dateStr && (
                            <span className="text-[10.5px] text-[#7B5D69] block">{dateStr}</span>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < r.rating
                                ? 'fill-[#D9A441] text-[#D9A441]'
                                : 'text-[#F5D5DB]'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    {r.title && (
                      <h4 className="font-display font-bold text-sm text-[#12233F] leading-snug">
                        {r.title}
                      </h4>
                    )}

                    {/* Review Comment */}
                    <p className="text-xs sm:text-sm text-[#171717] font-light leading-relaxed whitespace-pre-wrap">
                      &ldquo;{r.comment}&rdquo;
                    </p>

                    {/* Customer Photos Gallery */}
                    {r.images?.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-2">
                          {r.images.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxImg(imgUrl)}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#F5D5DB] hover:ring-2 hover:ring-[#B02F5E] transition-all group"
                            >
                              <img
                                src={imgUrl}
                                alt={`Customer photo ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={lightboxImg}
              alt="Customer product review"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#F5D5DB] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-[#F5D5DB]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B02F5E]">
                  Verified Feedback
                </span>
                <h3 className="font-display font-bold text-xl text-[#12233F]">
                  Write a Customer Review
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-[#FFF4F3] flex items-center justify-center text-[#7B5D69] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="my-4 p-3 rounded-xl bg-[#FFF4F3] border border-[#F5D5DB] flex items-center gap-3">
              <div className="relative w-12 h-14 rounded-md overflow-hidden bg-[#FCE4E8] shrink-0 border border-[#F5D5DB]">
                <Image src={productImg} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-xs sm:text-sm text-[#12233F] truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-[#7B5D69]">
                  Eligible only for delivered orders
                </p>
              </div>
            </div>

            {/* Step 1: Verification Form */}
            {step === 1 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    To ensure 100% genuine reviews, please enter the phone number or Order ID you used when placing your order.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1">
                    Phone Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9500381414"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#F5D5DB] rounded-lg px-3.5 py-2.5 text-xs bg-[#FFF4F3] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                  />
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#F5D5DB] w-full" />
                  <span className="bg-white px-2 text-[10px] text-[#7B5D69] uppercase tracking-wider absolute">
                    or
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1">
                    Order ID / Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JWW-2026-0042"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full border border-[#F5D5DB] rounded-lg px-3.5 py-2.5 text-xs bg-[#FFF4F3] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                  />
                </div>

                {verifyError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-boutique"
                >
                  {verifying && <Loader2 size={14} className="animate-spin" />}
                  {verifying ? 'Verifying order...' : 'Verify Purchase & Continue'}
                </button>
              </form>
            )}

            {/* Step 2: Review Content Form */}
            {step === 2 && (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                  <span>
                    Verified delivered order #{verifiedData?.orderNumber} for{' '}
                    <strong>{verifiedData?.customerName}</strong>
                  </span>
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={26}
                            className={
                              star <= (hoverRating || rating)
                                ? 'fill-[#D9A441] text-[#D9A441]'
                                : 'text-[#F5D5DB]'
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#B02F5E]">
                      {starLabels[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1">
                    Review Headline (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flawless fabric & perfect boutique stitching"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-[#F5D5DB] rounded-lg px-3.5 py-2.5 text-xs bg-[#FFF4F3] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1">
                    Detailed Review Description *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you liked about the material, fitting, color accuracy, and overall experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full border border-[#F5D5DB] rounded-lg px-3.5 py-2.5 text-xs bg-[#FFF4F3] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-xs font-semibold text-[#12233F] mb-1.5">
                    Upload Real Photos (optional, max 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {images.map((url, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#F5D5DB]"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-1"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[#F5D5DB] hover:border-[#B02F5E] flex flex-col items-center justify-center cursor-pointer text-[#7B5D69] transition-colors">
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin text-[#B02F5E]" />
                        ) : (
                          <>
                            <Camera size={18} />
                            <span className="text-[9px] mt-0.5">Add</span>
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

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-boutique"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-full border border-[#F5D5DB] text-xs font-semibold text-[#7B5D69] hover:bg-[#FFF4F3] transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success View */}
            {step === 3 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-display font-bold text-xl text-[#12233F]">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs sm:text-sm text-[#7B5D69] max-w-sm mx-auto leading-relaxed">
                  Your review has been submitted successfully and is awaiting admin approval.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-full bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
