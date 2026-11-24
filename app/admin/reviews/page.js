'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Check,
  X,
  Star,
  Trash2,
  Plus,
  Loader2,
  ImagePlus,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Package,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  // New review form modal
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    product: '',
    customerName: '',
    title: '',
    rating: 5,
    comment: '',
    images: [],
    isFeatured: false,
  });

  async function loadReviews() {
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast.error('Could not load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
  }

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, []);

  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Update failed');
        return;
      }
      toast.success(
        newStatus === 'approved'
          ? 'Review approved & product rating updated'
          : newStatus === 'rejected'
          ? 'Review rejected'
          : 'Status updated'
      );
      loadReviews();
    } catch {
      toast.error('Network error updating review');
    }
  }

  async function toggleFeatured(id, current) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (res.ok) {
        toast.success(!current ? 'Featured on homepage' : 'Unfeatured');
        loadReviews();
      }
    } catch {
      toast.error('Could not update featured flag');
    }
  }

  async function removeReview(id) {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted & ratings recalculated');
        loadReviews();
      } else {
        toast.error('Could not delete review');
      }
    } catch {
      toast.error('Network error deleting review');
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        const url = data.url || data.secure_url;
        if (url) urls.push(url);
        else toast.error(`Could not upload ${file.name}`);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function closeForm() {
    setShowForm(false);
    setForm({
      product: '',
      customerName: '',
      title: '',
      rating: 5,
      comment: '',
      images: [],
      isFeatured: false,
    });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.product || !form.customerName.trim() || !form.comment.trim()) {
      toast.error('Please select a product, customer name and review comment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review created & product rating updated');
        closeForm();
        loadReviews();
      } else {
        toast.error(data.error || 'Could not add review');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered reviews
  const counts = useMemo(() => {
    return {
      all: reviews.length,
      pending: reviews.filter((r) => r.status === 'pending' || (!r.status && !r.isApproved)).length,
      approved: reviews.filter((r) => r.status === 'approved' || r.isApproved).length,
      rejected: reviews.filter((r) => r.status === 'rejected').length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Tab filter
      const rStatus = r.status || (r.isApproved ? 'approved' : 'pending');
      if (tab === 'pending' && rStatus !== 'pending') return false;
      if (tab === 'approved' && rStatus !== 'approved') return false;
      if (tab === 'rejected' && rStatus !== 'rejected') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesProduct = r.product?.name?.toLowerCase().includes(q);
        const matchesCustomer = r.customerName?.toLowerCase().includes(q);
        const matchesComment = r.comment?.toLowerCase().includes(q);
        const matchesTitle = r.title?.toLowerCase().includes(q);
        const matchesOrder = r.order?.orderNumber?.toLowerCase().includes(q);
        if (!matchesProduct && !matchesCustomer && !matchesComment && !matchesTitle && !matchesOrder) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, tab, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#12233F]">
            Product Reviews
          </h1>
          <p className="text-xs sm:text-sm text-[#7B5D69] mt-0.5">
            Moderate genuine customer feedback, verify purchases, and approve ratings.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-[#F5D5DB] p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7B5D69]">
            Total Reviews
          </span>
          <p className="font-display text-2xl font-bold text-[#12233F] mt-1">{counts.all}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            Pending Approval
          </span>
          <p className="font-display text-2xl font-bold text-amber-700 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
            Approved Live
          </span>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1">{counts.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
            Rejected
          </span>
          <p className="font-display text-2xl font-bold text-rose-700 mt-1">{counts.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-xl border border-[#F5D5DB] p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending, alert: counts.pending > 0 },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                tab === t.id
                  ? 'bg-[#12233F] text-white shadow-sm'
                  : 'text-[#7B5D69] hover:bg-[#FFF4F3] hover:text-[#12233F]'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab === t.id
                    ? 'bg-white/20 text-white'
                    : t.alert
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#F5D5DB] text-[#7B5D69]'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B5D69]" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFF4F3] border border-[#F5D5DB] rounded-lg text-[#171717] placeholder-[#7B5D69] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-[#7B5D69]">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#B02F5E]" />
          <p className="text-xs">Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#F5D5DB] p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FFF4F3] text-[#7B5D69] flex items-center justify-center mx-auto mb-3">
            <Star size={22} strokeWidth={1.5} />
          </div>
          <h3 className="font-display font-semibold text-lg text-[#12233F]">No reviews found</h3>
          <p className="text-xs text-[#7B5D69] mt-1 max-w-sm mx-auto">
            {tab !== 'all'
              ? `There are no reviews currently in "${tab}" status.`
              : 'No customer reviews have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => {
            const status = r.status || (r.isApproved ? 'approved' : 'pending');
            const dateStr = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown date';

            const productImg =
              r.product?.variants?.[0]?.images?.[0] || '/placeholder.png';

            return (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-[#F5D5DB] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Reviewer Info & Content */}
                  <div className="flex-1 space-y-3">
                    {/* Top Row: User & Status Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
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
                            <span className="font-semibold text-sm text-[#12233F]">
                              {r.customerName}
                            </span>
                            {r.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Check size={10} strokeWidth={2.5} /> Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7B5D69]">{dateStr}</p>
                        </div>
                      </div>

                      {/* Status & Featured Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                        {status === 'approved' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle size={11} /> Rejected
                          </span>
                        )}
                        {r.isFeatured && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                            <Sparkles size={11} /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product & Order Info */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FFF4F3] border border-[#F5D5DB]/80">
                      <div className="relative w-10 h-12 rounded overflow-hidden shrink-0 border border-[#F5D5DB] bg-[#FCE4E8]">
                        <Image src={productImg} alt="" fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#12233F] truncate">
                          {r.product?.name || 'Product unavailable'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#7B5D69]">
                          {r.product?.basePrice && (
                            <span>{formatINR(r.product.basePrice)}</span>
                          )}
                          {r.order?.orderNumber && (
                            <>
                              <span>•</span>
                              <span>Order #{r.order.orderNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {r.product?.slug && (
                        <a
                          href={`/product/${r.product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#7B5D69] hover:text-[#B02F5E] p-1.5"
                          title="View product storefront"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Review Rating & Title */}
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < r.rating
                                ? 'fill-[#D9A441] text-[#D9A441]'
                                : 'text-[#F5D5DB]'
                            }
                          />
                        ))}
                        <span className="text-xs font-bold text-[#12233F] ml-1.5">
                          {r.rating} / 5
                        </span>
                      </div>
                      {r.title && (
                        <h4 className="font-semibold text-sm text-[#12233F] mt-1.5">
                          {r.title}
                        </h4>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-[#171717] font-light leading-relaxed whitespace-pre-wrap bg-white">
                      &ldquo;{r.comment}&rdquo;
                    </p>

                    {/* Uploaded Photos */}
                    {r.images?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7B5D69] block mb-1.5">
                          Customer Photos ({r.images.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {r.images.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxImg(url)}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#F5D5DB] hover:ring-2 hover:ring-[#B02F5E] transition-all"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions Toolbar */}
                  <div className="flex lg:flex-col gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F5D5DB] shrink-0 justify-end">
                    {/* Approve Button */}
                    {status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(r._id, 'approved')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        title="Approve review"
                      >
                        <Check size={14} /> Approve
                      </button>
                    )}

                    {/* Reject Button */}
                    {status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(r._id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                        title="Reject review"
                      >
                        <X size={14} /> Reject
                      </button>
                    )}

                    {/* Revert to Pending if already decided */}
                    {status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(r._id, 'pending')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                        title="Set to Pending"
                      >
                        <Clock size={13} /> Reset Pending
                      </button>
                    )}

                    {/* Toggle Feature on Homepage */}
                    <button
                      onClick={() => toggleFeatured(r._id, r.isFeatured)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        r.isFeatured
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-white text-[#7B5D69] border-[#F5D5DB] hover:bg-[#FFF4F3]'
                      }`}
                      title="Feature on homepage"
                    >
                      <Sparkles size={13} className={r.isFeatured ? 'fill-purple-700' : ''} />
                      {r.isFeatured ? 'Featured' : 'Feature'}
                    </button>

                    {/* Delete Permanently */}
                    <button
                      onClick={() => removeReview(r._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={lightboxImg}
              alt="Customer review photo"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Add Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={submitForm}
            className="w-full max-w-xl bg-white rounded-2xl border border-[#F5D5DB] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#F5D5DB]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#12233F]">
                  Add Customer Review
                </h3>
                <p className="text-xs text-[#7B5D69]">Create a verified review for a product.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-full hover:bg-[#FFF4F3] flex items-center justify-center text-[#7B5D69]"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1">
                Select Product *
              </label>
              <select
                className="w-full border border-[#F5D5DB] rounded-lg px-3 py-2 text-xs bg-[#FFF4F3] focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                required
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sundaram"
                className="w-full border border-[#F5D5DB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1">
                Star Rating *
              </label>
              <div className="flex gap-1 py-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm({ ...form, rating: i + 1 })}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={
                        i < form.rating
                          ? 'fill-[#D9A441] text-[#D9A441]'
                          : 'text-[#F5D5DB]'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1">
                Review Title (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Flawless Fit & Premium Fabric"
                className="w-full border border-[#F5D5DB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1">
                Review Description *
              </label>
              <textarea
                rows={3}
                placeholder="Write the customer's experience and feedback..."
                className="w-full border border-[#F5D5DB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#B02F5E]"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12233F] mb-1.5">
                Review Photos (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#F5D5DB]"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[#F5D5DB] hover:border-[#B02F5E] flex items-center justify-center cursor-pointer text-[#7B5D69] transition-colors">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin text-[#B02F5E]" />
                  ) : (
                    <ImagePlus size={18} />
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
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#12233F] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded text-[#B02F5E] focus:ring-[#B02F5E]"
              />
              Feature this review on the Homepage
            </label>

            <div className="flex gap-2 pt-3 border-t border-[#F5D5DB]">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Saving...' : 'Save & Publish Review'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 rounded-lg border border-[#F5D5DB] text-xs font-semibold text-[#7B5D69] hover:bg-[#FFF4F3] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
