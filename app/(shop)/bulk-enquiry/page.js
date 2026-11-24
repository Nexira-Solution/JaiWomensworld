'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Sparkles, Building2 } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || '919500381414';
const FALLBACK_PRODUCTS = ['Salwar Sets', 'Rayon Umbrella Kurtis', 'Side Open Kurtis', 'Nighties', 'Other Boutique Wear'];

function Field({ error, children }) {
  return (
    <div>
      {children}
      {error && (
        <p className="text-[11px] mt-1 text-[#C2384F] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export default function BulkEnquiryPage() {
  const [productTypes, setProductTypes] = useState(FALLBACK_PRODUCTS);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    pincode: '',
    phone: '',
    product: '',
    quantity: '',
    message: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        const names = (d.topLevel || []).map((c) => c.name).filter(Boolean);
        if (names.length) setProductTypes([...names, 'Other Boutique Wear']);
      })
      .catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.address.trim()) e.address = 'Please enter your shipping/business address';
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10)))
      e.phone = 'Enter a valid 10-digit phone number';
    if (!form.product) e.product = 'Select a product category';
    if (!form.quantity || Number(form.quantity) < 1) e.quantity = 'Enter the required quantity';
    if (!form.agree) e.agree = 'Please accept the Terms & Conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    const lines = [
      '*Jai Womens World — Wholesale / Bulk Order Enquiry*',
      '',
      `*Name:* ${form.name.trim()}`,
      `*Email:* ${form.email.trim()}`,
      `*Phone:* ${form.phone.trim()}`,
      `*Address:* ${form.address.trim()}`,
      `*Pincode:* ${form.pincode.trim()}`,
      `*Product Category:* ${form.product}`,
      `*Quantity Required:* ${form.quantity}`,
    ];
    if (form.message.trim()) lines.push('', `*Details:* ${form.message.trim()}`);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const inputClass =
    'w-full px-4 py-3 text-sm bg-white border border-[#F5D5DB] rounded focus:border-[#B02F5E] outline-none transition-colors text-[#171717] placeholder:text-[#7B5D69]';

  return (
    <div className="bg-[#FFF4F3] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B02F5E] mb-2">
            <Building2 size={13} className="text-[#D9A441]" />
            Wholesale &amp; Bulk Orders
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#12233F]">
            Bulk Purchase Enquiry
          </h1>
          <div className="w-10 h-0.5 bg-[#D9A441] mx-auto my-3" />
          <p className="text-xs sm:text-sm text-[#7B5D69] font-light max-w-lg mx-auto leading-relaxed">
            Planning a bulk purchase for a wedding, family function, or retail reselling? Fill in your details below and we will contact you with special trade prices.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="bg-white rounded-xl border border-[#F5D5DB] shadow-card p-6 sm:p-10 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field error={errors.name}>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field error={errors.phone}>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field error={errors.email}>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field error={errors.address}>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
              Delivery / Business Address *
            </label>
            <input
              type="text"
              placeholder="Street address, city, state"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field error={errors.pincode}>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
                Pincode *
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit pincode"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field error={errors.product}>
              <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
                Product Category *
              </label>
              <select
                value={form.product}
                onChange={(e) => update('product', e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select a category</option>
                {productTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field error={errors.quantity}>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
              Quantity Needed (Pieces) *
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className={inputClass}
            />
          </Field>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-[#7B5D69] mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Sizes, preferred colors, delivery date, custom stitching requirements..."
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <Field error={errors.agree}>
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => update('agree', e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#12233F] accent-[#12233F]"
              />
              <span className="text-xs text-[#7B5D69] leading-relaxed">
                I agree to be contacted on WhatsApp / Phone regarding this enquiry and accept the store policies.
              </span>
            </label>
          </Field>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-boutique flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            <span>Submit via WhatsApp</span>
          </button>
        </form>

      </div>
    </div>
  );
}
