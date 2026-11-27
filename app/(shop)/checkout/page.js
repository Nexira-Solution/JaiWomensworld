'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';
import { INDIAN_STATES } from '@/lib/indianStates';

// JAI WOMENS WORLD Brand Palette
const INK = '#171717';
const INK_SOFT = '#7B5D69';
const TEAL = '#12233F';          // Deep Navy primary
const ROSE = '#B02F5E';          // Muted Rose
const WASH = '#FCE4E8';
const LINE = '#F5D5DB';
const PAPER = '#FFF4F3';
const RUST = '#C2384F';          // warning/error
const RUST_WASH = '#FBEAE6';
const TEAL_DISABLED = '#8F9CA8'; // muted navy for disabled submit
const FONT_SERIF = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

const inputClass =
  'w-full text-sm outline-none transition-colors px-3.5 py-2.5';
const inputStyle = { border: `1px solid ${LINE}`, borderRadius: '3px', color: INK, background: PAPER };

const sectionHeadClass = 'text-[11px] font-medium uppercase tracking-[0.18em] mb-4';

// ---------- Validation ----------
function getValidators(isInternational) {
  return {
    name: (v) => {
      const s = String(v || '').trim();
      if (!s) return 'Full name is required';
      if (s.length < 3) return 'Enter your full name';
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(s)) return 'Name can only contain letters';
      return '';
    },
    phone: (v) => {
      if (!v) return 'Phone number is required';
      const digits = String(v).replace(/\D/g, '');
      if (isInternational) {
        if (digits.length < 7) return 'Enter a valid phone number (at least 7 digits)';
        return '';
      }
      if (!/^\d+$/.test(v)) return 'Digits only';
      if (v.length !== 10) return 'Phone number must be exactly 10 digits';
      if (!/^[6-9]/.test(v)) return 'Enter a valid Indian mobile number (starts with 6–9)';
      if (/^(\d)\1{9}$/.test(v)) return 'Enter a valid phone number';
      return '';
    },
    email: (v) => {
      if (!v || !v.trim()) return ''; // optional
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address';
    },
    line1: (v) => {
      const s = String(v || '').trim();
      if (!s) return 'Address is required';
      if (s.length < 5) return 'Address is too short';
      if (!/[A-Za-z0-9]/.test(s)) return 'Enter a valid address';
      return '';
    },
    city: (v) => {
      const s = String(v || '').trim();
      if (!s) return 'City is required';
      if (s.length < 2) return 'Enter a valid city';
      return '';
    },
    state: (v) => {
      const s = String(v || '').trim();
      if (!s) return isInternational ? 'State / Province is required' : 'Select your state';
      if (!isInternational && !INDIAN_STATES.includes(s)) return 'Select a valid Indian state';
      return '';
    },
    pincode: (v) => {
      if (!v || !String(v).trim()) return isInternational ? 'Postal code is required' : 'Pincode is required';
      if (!isInternational) {
        if (!/^[1-9]\d{5}$/.test(String(v))) return 'Pincode must be exactly 6 digits';
      }
      return '';
    },
    country: (v) => (v ? '' : 'Select your country'),
  };
}

// Strips invalid characters depending on domestic vs international
function cleanPhone(raw, isInternational) {
  if (isInternational) {
    return raw.replace(/[^\d+ -]/g, '').slice(0, 18);
  }
  let d = raw.replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2);
  if (d.length > 10 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

function SSRKInput({ placeholder, type = 'text', value, onChange, onBlur, autoComplete, inputMode, maxLength, error }) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        className={inputClass}
        style={{ ...inputStyle, borderColor: error ? RUST : LINE }}
      />
      {error && <p className="text-[11px] mt-1" style={{ color: RUST }}>{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, totalPieces, clearCart, updateQty, removeItem, setItemStock } = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: '', pincode: '', landmark: '',
    country: 'India'
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || null))
      .catch(() => {});
  }, []);

  const isInternational = useMemo(() => {
    const c = String(form.country || '').trim().toLowerCase();
    return Boolean(c && c !== 'india' && c !== 'in');
  }, [form.country]);

  const availableCountries = useMemo(() => {
    if (!settings?.internationalShippingEnabled) return [];
    return (settings.internationalShipping || [])
      .filter((r) => r.enabled !== false && String(r.country || '').trim().toLowerCase() !== 'india')
      .map((r) => r.country);
  }, [settings]);

  // Coupon: `coupon` is what the user types, `appliedCoupon` is only set
  // after the server confirms the code is valid.
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Wholesale discounts
  const [wholesaleDiscount, setWholesaleDiscount] = useState(0);
  const [wholesaleTier, setWholesaleTier] = useState(null);
  const [nextWholesaleTier, setNextWholesaleTier] = useState(null);
  const [piecesNeededForNextTier, setPiecesNeededForNextTier] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const [shipping, setShipping] = useState(null);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliverable, setDeliverable] = useState(true);
  const [shippingError, setShippingError] = useState('');
  const [serverTotal, setServerTotal] = useState(null);

  const isInternationalPaymentAllowed = Boolean(settings?.internationalPaymentEnabled);

  // Switch paymentMethod automatically when switching domestic vs international
  useEffect(() => {
    if (isInternational) {
      if (isInternationalPaymentAllowed) {
        setPaymentMethod('international');
      } else {
        setPaymentMethod('');
      }
    } else {
      setPaymentMethod('razorpay');
    }
  }, [isInternational, isInternationalPaymentAllowed]);

  const totalDiscount = discount + wholesaleDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const total = serverTotal !== null ? serverTotal : (shipping !== null ? Math.round(discountedSubtotal + shipping) : null);

  // Validation state
  const errors = useMemo(() => {
    const vMap = getValidators(isInternational);
    const e = {};
    Object.keys(vMap).forEach((k) => { e[k] = vMap[k](form[k] || ''); });
    return e;
  }, [form, isInternational]);

  const isFormValid = Object.values(errors).every((m) => !m);

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));
  const err = (field) => (touched[field] ? errors[field] : '');

  // Lines sent to the quote & order API
  const orderItemsPayload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        size: i.size,
        sleeveType: i.sleeveType || '',
        zipType: i.zipType || '',
        pantOption: i.pantOption,
        shawlOption: i.shawlOption,
        qty: i.qty,
        isCombo: i.isCombo || false,
        comboId: i.comboId,
        ...(i.packDetails ? { packDetails: i.packDetails } : {}),
      })),
    [items]
  );

  const fetchShipping = useCallback(async () => {
    setShippingLoading(true);
    try {
      const res = await fetch('/api/cart/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItemsPayload,
          couponCode: appliedCoupon,
          state: form.state,
          country: form.country || 'India'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShipping(data.shippingFee);
        setFreeShippingAbove(data.freeShippingAbove);
        setDeliverable(data.deliverable !== false);
        setWholesaleDiscount(data.wholesaleDiscount || 0);
        setWholesaleTier(data.wholesaleTier || null);
        setNextWholesaleTier(data.nextWholesaleTier || null);
        setPiecesNeededForNextTier(data.piecesNeededForNextTier || 0);
        setServerTotal(data.total);
        setShippingError('');
      } else {
        setDeliverable(false);
        setShippingError(data.error || 'Could not calculate shipping');
        setShipping(null);
      }
    } catch {
      toast.error('Could not calculate shipping');
    } finally {
      setShippingLoading(false);
    }
  }, [orderItemsPayload, appliedCoupon, form.state, form.country]);

  useEffect(() => { fetchShipping(); }, [fetchShipping]);

  function update(field, value) {
    if (field === 'phone') value = cleanPhone(value, isInternational);
    if (field === 'pincode' && !isInternational) value = value.replace(/\D/g, '').slice(0, 6);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function applyCoupon(codeArg) {
    const code = (typeof codeArg === 'string' ? codeArg : coupon).trim();
    if (!code) { toast.error('Enter a coupon code'); return; }

    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setAppliedCoupon(code.toUpperCase());
        setCoupon(code.toUpperCase());
        toast.success(data.message);
      } else {
        setDiscount(0);
        setAppliedCoupon('');
        toast.error(data.message || 'Invalid coupon');
      }
    } catch {
      toast.error('Could not apply coupon, please try again');
    } finally {
      setApplyingCoupon(false);
    }
  }

  function removeCoupon() {
    setDiscount(0);
    setAppliedCoupon('');
    setCoupon('');
  }

  // If the cart changes after a coupon is applied, re-check it so the
  // discount never goes stale (min order value, percent amount, etc.).
  useEffect(() => {
    if (appliedCoupon) applyCoupon(appliedCoupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  async function validateStockBeforeOrder() {
    setCheckingStock(true);
    try {
      const res = await fetch('/api/cart/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            size: i.size,
            qty: i.qty,
            name: i.name,
            isCombo: i.isCombo || false,
            comboId: i.comboId,
            packKey: i.packKey,
            packDetails: i.packDetails,
            sleeveType: i.sleeveType,
            zipType: i.zipType,
            pantOption: i.pantOption,
            shawlOption: i.shawlOption,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not verify stock, please try again');
        return false;
      }

      if (data.valid) return true;

      data.issues.forEach((issue) => {
        const key = cartKey(issue);
        if (issue.reason === 'unavailable' || issue.reason === 'out_of_stock') {
          toast.error(`${issue.name || 'An item'} is out of stock and was removed from your cart`);
          removeItem(key);
        } else if (issue.reason === 'insufficient_stock') {
          toast.error(`Only ${issue.availableStock} left of ${issue.name || 'an item'} — quantity adjusted`);
          updateQty(key, issue.availableStock);
          setItemStock(key, issue.availableStock);
        }
      });

      return false;
    } catch {
      toast.error('Could not verify stock, please try again');
      return false;
    } finally {
      setCheckingStock(false);
    }
  }

  async function placeOrder() {
    if (!isFormValid) {
      setTouched({ name: true, phone: true, email: true, line1: true, city: true, state: true, pincode: true, country: true });
      const firstError = Object.values(errors).find(Boolean);
      toast.error(firstError || 'Please fix the highlighted fields');
      return;
    }
    if (!deliverable) {
      toast.error(shippingError || `Sorry, we don't deliver to ${isInternational ? form.country : form.state} yet`);
      return;
    }
    if (isInternational && !isInternationalPaymentAllowed) {
      toast.error('International online payments are currently unavailable');
      return;
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    if (shipping === null) { toast.error('Shipping is still being calculated, please wait'); return; }

    setSubmitting(true);

    const stockOk = await validateStockBeforeOrder();
    if (!stockOk) {
      setSubmitting(false);
      return;
    }

    // Send trimmed values to the server
    const cleanForm = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      landmark: form.landmark.trim(),
      country: form.country.trim() || 'India'
    };

    const activePaymentMethod = isInternational ? 'international' : 'razorpay';

    try {
      if (activePaymentMethod === 'razorpay' || activePaymentMethod === 'international') {
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItemsPayload,
            customer: { name: cleanForm.name, phone: cleanForm.phone, email: cleanForm.email },
            shippingAddress: cleanForm,
            couponCode: appliedCoupon,
            expectedTotal: total,
            paymentMethod: activePaymentMethod,
            country: cleanForm.country
          })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          toast.error(orderData.error || 'Payment gateway error');
          if (orderRes.status === 409) fetchShipping();
          setSubmitting(false);
          return;
        }

        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: 'INR',
          name: 'Jai Womens World',
          order_id: orderData.order.id,
          prefill: { name: cleanForm.name, contact: cleanForm.phone, email: cleanForm.email },
          theme: { color: '#12233F' },
          handler: async function (response) {
            const finalRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: orderItemsPayload,
                customer: { name: cleanForm.name, phone: cleanForm.phone, email: cleanForm.email },
                shippingAddress: cleanForm,
                couponCode: appliedCoupon,
                paymentMethod: activePaymentMethod,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const finalData = await finalRes.json();
            if (finalRes.ok) {
              clearCart();
              router.push(`/order-success/${finalData.order._id}`);
            } else {
              toast.error(
                `Payment received — confirming your order. If it doesn't appear shortly, contact support with payment ID ${response.razorpay_payment_id}.`,
                { duration: 8000 }
              );
              clearCart();
              router.push('/');
            }
            setSubmitting(false);
          },
          modal: { ondismiss: () => setSubmitting(false) }
        });
        rzp.open();
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderItemsPayload,
            customer: { name: cleanForm.name, phone: cleanForm.phone, email: cleanForm.email },
            shippingAddress: cleanForm,
            couponCode: appliedCoupon,
            paymentMethod: 'cod'
          })
        });
        const data = await res.json();
        if (res.ok) { clearCart(); router.push(`/order-success/${data.order._id}`); }
        else { toast.error(data.error || 'Could not place order'); }
        setSubmitting(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const placeOrderDisabled =
    submitting || shippingLoading || checkingStock || applyingCoupon ||
    shipping === null || !deliverable || !isFormValid ||
    (isInternational && !isInternationalPaymentAllowed) ||
    (!isInternational && paymentMethod !== 'razorpay') ||
    (isInternational && paymentMethod !== 'international');

  // Free shipping banner
  const amountToFreeShipping =
    freeShippingAbove !== null && freeShippingAbove > 0
      ? freeShippingAbove - discountedSubtotal
      : 0;
  const showFreeShippingBanner =
    deliverable && shipping !== null && shipping > 0 && amountToFreeShipping > 0;

  const applyDisabled = applyingCoupon || !coupon.trim();

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-14" style={{ background: PAPER }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <h1 className="text-[24px] sm:text-[28px] mb-7" style={{ fontFamily: FONT_SERIF, color: TEAL }}>
        Checkout
      </h1>

      {nextWholesaleTier && piecesNeededForNextTier > 0 && (
        <div
          className="text-xs py-2.5 px-4 mb-4"
          style={{ background: WASH, color: INK_SOFT, borderRadius: '3px' }}
        >
          Wholesale Offer: Add <strong style={{ color: TEAL }}>{piecesNeededForNextTier} more piece{piecesNeededForNextTier > 1 ? 's' : ''}</strong> to unlock <strong style={{ color: TEAL }}>{nextWholesaleTier.description}</strong>!
        </div>
      )}

      {showFreeShippingBanner && (
        <div
          className="text-xs py-2.5 px-4 mb-6"
          style={{ background: WASH, color: INK_SOFT, borderRadius: '3px' }}
        >
          Add <strong style={{ color: TEAL }}>{formatINR(amountToFreeShipping)}</strong> more to get{' '}
          <strong style={{ color: TEAL }}>free shipping</strong>
        </div>
      )}

      {!deliverable && (
        <div
          className="text-xs py-2.5 px-4 mb-6"
          style={{ background: RUST_WASH, color: RUST, borderRadius: '3px' }}
        >
          {shippingError || `Sorry, we don't deliver to ${isInternational ? form.country : form.state} yet. Please choose another destination.`}
        </div>
      )}

      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-10 lg:gap-12">

        <div>
          <p className={sectionHeadClass} style={{ color: TEAL }}>Shipping Details</p>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider block mb-1" style={{ color: INK_SOFT }}>
                Delivery Country *
              </label>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                onBlur={() => touch('country')}
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: err('country') ? RUST : LINE,
                  color: form.country ? INK : INK_SOFT,
                }}
              >
                <option value="India">India (Domestic)</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {err('country') && (
                <p className="text-[11px] mt-1" style={{ color: RUST }}>{err('country')}</p>
              )}
            </div>

            <SSRKInput
              placeholder="Full Name *"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onBlur={() => touch('name')}
              error={err('name')}
            />
            <SSRKInput
              placeholder={isInternational ? 'Phone Number (with country code) *' : 'Phone Number (10 digits) *'}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={isInternational ? 18 : 10}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              onBlur={() => touch('phone')}
              error={err('phone')}
            />
            <SSRKInput
              placeholder="Email (optional)"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => touch('email')}
              error={err('email')}
            />
            <SSRKInput
              placeholder="Address Line 1 *"
              autoComplete="address-line1"
              value={form.line1}
              onChange={(e) => update('line1', e.target.value)}
              onBlur={() => touch('line1')}
              error={err('line1')}
            />
            <SSRKInput
              placeholder="Address Line 2"
              autoComplete="address-line2"
              value={form.line2}
              onChange={(e) => update('line2', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <SSRKInput
                placeholder="City *"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                onBlur={() => touch('city')}
                error={err('city')}
              />
              <div>
                {!isInternational ? (
                  <>
                    <select
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      onBlur={() => touch('state')}
                      className={inputClass}
                      style={{
                        ...inputStyle,
                        borderColor: err('state') ? RUST : LINE,
                        color: form.state ? INK : INK_SOFT,
                      }}
                    >
                      <option value="">State *</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {err('state') && (
                      <p className="text-[11px] mt-1" style={{ color: RUST }}>{err('state')}</p>
                    )}
                  </>
                ) : (
                  <SSRKInput
                    placeholder="State / Province *"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    onBlur={() => touch('state')}
                    error={err('state')}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SSRKInput
                placeholder={isInternational ? 'Postal Code / Zip *' : 'Pincode (6 digits) *'}
                inputMode={isInternational ? 'text' : 'numeric'}
                maxLength={isInternational ? 10 : 6}
                autoComplete="postal-code"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                onBlur={() => touch('pincode')}
                error={err('pincode')}
              />
              <SSRKInput
                placeholder="Landmark"
                value={form.landmark}
                onChange={(e) => update('landmark', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">

          <div>
            <p className={sectionHeadClass} style={{ color: TEAL }}>Order Summary</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 gap-2" style={{ color: INK_SOFT }}>
                  <span className="truncate">
                    {i.name} ({[i.color, i.packDetails ? '' : i.size, i.sleeveType, i.zipType].filter(Boolean).join('/')}) ×{i.qty}
                    {i.isCombo && i.pieces > 1 ? ` · ${i.qty * i.pieces} pcs` : ''}
                  </span>
                  <span className="shrink-0" style={{ color: INK }}>{formatINR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Coupon: user types the code, then applies it */}
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code"
                  value={coupon}
                  disabled={Boolean(appliedCoupon) || applyingCoupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && !appliedCoupon && applyCoupon()}
                  autoCapitalize="characters"
                  className={`${inputClass} flex-1 uppercase`}
                  style={{ ...inputStyle, opacity: appliedCoupon ? 0.7 : 1 }}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="px-4 text-sm shrink-0 transition-colors"
                    style={{ border: `1px solid ${LINE}`, color: INK_SOFT, background: PAPER, borderRadius: '3px' }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon()}
                    disabled={applyDisabled}
                    className="px-4 text-sm shrink-0 transition-colors disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid ${applyDisabled ? TEAL_DISABLED : TEAL}`,
                      color: applyDisabled ? TEAL_DISABLED : TEAL,
                      background: PAPER,
                      borderRadius: '3px',
                    }}
                  >
                    {applyingCoupon ? 'Applying…' : 'Apply'}
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-xs mt-1.5" style={{ color: TEAL }}>
                  {appliedCoupon} applied. You saved {formatINR(discount)}
                </p>
              )}
            </div>

            <div style={{ height: '1px', background: LINE }} className="my-4" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between" style={{ color: INK_SOFT }}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {wholesaleDiscount > 0 && (
                <div className="flex justify-between" style={{ color: TEAL }}>
                  <span>Wholesale Discount{wholesaleTier?.description ? ` (${wholesaleTier.description})` : ''}</span>
                  <span>−{formatINR(wholesaleDiscount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: TEAL }}>
                  <span>Coupon Discount{appliedCoupon ? ` (${appliedCoupon})` : ''}</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: INK_SOFT }}>
                <span>Shipping {isInternational ? `(${form.country})` : ''}</span>
                <span>
                  {!deliverable
                    ? <span style={{ color: RUST }}>Not available for {isInternational ? form.country : form.state}</span>
                    : shippingLoading
                      ? <span style={{ color: INK_SOFT, opacity: 0.6 }}>Calculating…</span>
                      : shipping === 0
                        ? <span style={{ color: TEAL }}>Free</span>
                        : shipping !== null
                          ? formatINR(shipping)
                          : <span style={{ color: INK_SOFT, opacity: 0.6 }}>—</span>
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-3 pt-3 text-base" style={{ borderTop: `1px solid ${LINE}` }}>
              <span style={{ color: INK }}>Total</span>
              <span style={{ color: TEAL, fontFamily: FONT_SERIF }}>
                {deliverable && total !== null ? formatINR(total) : '—'}
              </span>
            </div>
          </div>

          <div>
            <p className={sectionHeadClass} style={{ color: TEAL }}>Payment Method</p>
            <div className="space-y-2.5">
              {/* Option 1: Pay Online */}
              <label
                className={`flex items-start gap-3 p-3 sm:p-3.5 rounded border transition-all ${
                  !isInternational
                    ? 'cursor-pointer hover:border-[#12233F]'
                    : 'cursor-not-allowed opacity-50 bg-black/[0.02]'
                }`}
                style={{
                  borderColor: !isInternational && paymentMethod === 'razorpay' ? TEAL : LINE,
                  background: !isInternational && paymentMethod === 'razorpay' ? '#FFFFFF' : PAPER,
                }}
              >
                <input
                  type="radio"
                  name="checkoutPaymentMethod"
                  value="razorpay"
                  disabled={isInternational}
                  checked={!isInternational && paymentMethod === 'razorpay'}
                  onChange={() => {
                    if (!isInternational) setPaymentMethod('razorpay');
                  }}
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ accentColor: TEAL }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-sm font-medium" style={{ color: INK }}>Pay Online</span>
                    {!isInternational && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FCE4E8] text-[#B02F5E] font-medium uppercase tracking-wider">
                        Domestic
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: INK_SOFT }}>
                    Cards / UPI / Netbanking
                  </p>
                  {isInternational && (
                    <p className="text-[11px] mt-1 text-[#7B5D69]">
                      Available for deliveries within India only
                    </p>
                  )}
                </div>
              </label>

              {/* Option 2: International Payments (placed directly below Pay Online) */}
              <label
                className={`flex items-start gap-3 p-3 sm:p-3.5 rounded border transition-all ${
                  isInternational && isInternationalPaymentAllowed
                    ? 'cursor-pointer hover:border-[#12233F]'
                    : 'cursor-not-allowed opacity-50 bg-black/[0.02]'
                }`}
                style={{
                  borderColor: isInternational && paymentMethod === 'international' ? TEAL : LINE,
                  background: isInternational && paymentMethod === 'international' ? '#FFFFFF' : PAPER,
                }}
              >
                <input
                  type="radio"
                  name="checkoutPaymentMethod"
                  value="international"
                  disabled={!isInternational || !isInternationalPaymentAllowed}
                  checked={isInternational && paymentMethod === 'international'}
                  onChange={() => {
                    if (isInternational && isInternationalPaymentAllowed) setPaymentMethod('international');
                  }}
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ accentColor: TEAL }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-sm font-medium" style={{ color: INK }}>International Payments</span>
                    {isInternational && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#12233F]/10 text-[#12233F] font-medium uppercase tracking-wider">
                        International
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: INK_SOFT }}>
                    Secure payment for international orders
                  </p>
                  {!isInternational && (
                    <p className="text-[11px] mt-1 text-[#7B5D69]">
                      Available for international delivery destinations
                    </p>
                  )}
                </div>
              </label>

              {/* Notice if destination is international and payment is unconfigured */}
              {isInternational && !isInternationalPaymentAllowed && (
                <div
                  className="text-xs py-2.5 px-3.5 rounded border border-[#F5D5DB]"
                  style={{ background: RUST_WASH, color: RUST }}
                >
                  International online payments are currently unavailable. Please contact store support.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placeOrderDisabled}
            className="w-full py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
            style={{
              background: placeOrderDisabled ? TEAL_DISABLED : TEAL,
              color: PAPER,
              borderRadius: '4px',
            }}
          >
            {submitting
              ? (checkingStock ? 'Checking stock…' : 'Placing Order…')
              : !isFormValid
                ? 'Complete shipping details'
                : !deliverable
                  ? (shippingError || `Not deliverable to ${isInternational ? form.country : form.state}`)
                  : (isInternational && !isInternationalPaymentAllowed)
                    ? 'Payment unavailable for this country'
                    : shippingLoading
                      ? 'Calculating shipping…'
                      : total !== null
                        ? `Place Order — ${formatINR(total)}`
                        : 'Place Order'
            }
          </button>
        </div>
      </div>
    </div>
  );
}