'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/indianStates';
import { getYouTubeId } from '@/lib/youtube';

const LIVE_DAYS = [
  ['yesterday', 'Yesterday (replay)'],
  ['today', 'Today (live)'],
  ['tomorrow', 'Tomorrow (upcoming)']
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState(null);
  const [stateToAdd, setStateToAdd] = useState('');
  const [newCountry, setNewCountry] = useState({ country: '', countryCode: '', shippingCharge: '', freeShippingAbove: '' });
  const [newTier, setNewTier] = useState({ minQty: '', maxQty: '', discountType: 'percentage', discountValue: '', description: '' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) =>
        setForm({
          ...d.settings,
          stateShipping: d.settings.stateShipping || [],
          internationalShipping: d.settings.internationalShipping || [],
          internationalShippingEnabled: Boolean(d.settings.internationalShippingEnabled),
          internationalPaymentEnabled: Boolean(d.settings.internationalPaymentEnabled),
          wholesaleDiscountsEnabled: Boolean(d.settings.wholesaleDiscountsEnabled),
          wholesaleTiers: d.settings.wholesaleTiers || [],
          liveStreams: {
            yesterday: { title: '', url: '', ...d.settings.liveStreams?.yesterday },
            today: { title: '', url: '', ...d.settings.liveStreams?.today },
            tomorrow: { title: '', url: '', ...d.settings.liveStreams?.tomorrow }
          }
        })
      );
  }, []);

  async function submit(e) {
    e.preventDefault();

    const badDay = LIVE_DAYS.find(([day]) => {
      const url = form.liveStreams[day].url.trim();
      return url && !getYouTubeId(url);
    });
    if (badDay) {
      toast.error(`${badDay[1]}: not a valid YouTube link`);
      return;
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) toast.success('Settings saved');
    else toast.error('Could not save settings');
  }

  function addStateRule() {
    if (!stateToAdd) return;
    if (form.stateShipping.some((r) => r.state === stateToAdd)) {
      toast.error(`${stateToAdd} already has a rule`);
      return;
    }
    setForm((f) => ({
      ...f,
      stateShipping: [
        ...f.stateShipping,
        { state: stateToAdd, enabled: true, pricePerKg: null, defaultShippingCharge: null, freeShippingAbove: null }
      ]
    }));
    setStateToAdd('');
  }

  function updateRule(idx, patch) {
    setForm((f) => ({
      ...f,
      stateShipping: f.stateShipping.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    }));
  }

  function removeRule(idx) {
    setForm((f) => ({ ...f, stateShipping: f.stateShipping.filter((_, i) => i !== idx) }));
  }

  function addCountryRule() {
    const country = newCountry.country.trim();
    if (!country) {
      toast.error('Country name is required');
      return;
    }
    if (form.internationalShipping.some((r) => r.country.toLowerCase() === country.toLowerCase())) {
      toast.error(`${country} already has a shipping configuration`);
      return;
    }
    const charge = Math.max(0, Number(newCountry.shippingCharge) || 0);
    const freeAbove = newCountry.freeShippingAbove !== '' ? Math.max(0, Number(newCountry.freeShippingAbove) || 0) : null;
    setForm((f) => ({
      ...f,
      internationalShipping: [
        ...f.internationalShipping,
        {
          country,
          countryCode: newCountry.countryCode.trim().toUpperCase(),
          shippingCharge: charge,
          freeShippingAbove: freeAbove,
          enabled: true
        }
      ]
    }));
    setNewCountry({ country: '', countryCode: '', shippingCharge: '', freeShippingAbove: '' });
  }

  function updateCountryRule(idx, patch) {
    setForm((f) => ({
      ...f,
      internationalShipping: f.internationalShipping.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    }));
  }

  function removeCountryRule(idx) {
    setForm((f) => ({
      ...f,
      internationalShipping: f.internationalShipping.filter((_, i) => i !== idx)
    }));
  }

  function addWholesaleTier() {
    const min = Number(newTier.minQty);
    const val = Number(newTier.discountValue);
    if (!min || min < 1) {
      toast.error('Minimum quantity must be at least 1');
      return;
    }
    if (!val || val <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    const max = newTier.maxQty !== '' ? Number(newTier.maxQty) : null;
    if (max !== null && max < min) {
      toast.error('Maximum quantity must be greater than or equal to minimum quantity');
      return;
    }
    setForm((f) => ({
      ...f,
      wholesaleTiers: [
        ...f.wholesaleTiers,
        {
          minQty: min,
          maxQty: max,
          discountType: newTier.discountType,
          discountValue: val,
          description: newTier.description.trim() || `${val}${newTier.discountType === 'percentage' ? '%' : '₹'} off on ${min}${max ? `-${max}` : '+'} pieces`
        }
      ].sort((a, b) => a.minQty - b.minQty)
    }));
    setNewTier({ minQty: '', maxQty: '', discountType: 'percentage', discountValue: '', description: '' });
  }

  function updateWholesaleTier(idx, patch) {
    setForm((f) => ({
      ...f,
      wholesaleTiers: f.wholesaleTiers.map((t, i) => (i === idx ? { ...t, ...patch } : t))
    }));
  }

  function removeWholesaleTier(idx) {
    setForm((f) => ({
      ...f,
      wholesaleTiers: f.wholesaleTiers.filter((_, i) => i !== idx)
    }));
  }

  function updateLive(day, patch) {
    setForm((f) => ({
      ...f,
      liveStreams: { ...f.liveStreams, [day]: { ...f.liveStreams[day], ...patch } }
    }));
  }

  // Empty input = null = "use the global value"
  const numOrNull = (v) => (v === '' ? null : Number(v));

  if (!form) return <p className="text-brand-ink/50">Loading...</p>;

  const availableStates = INDIAN_STATES.filter((s) => !form.stateShipping.some((r) => r.state === s));

  return (
    <div className="max-w-4xl w-full">
      <h1 className="font-display text-2xl font-bold text-brand-magenta mb-5">Store Settings</h1>
      <form onSubmit={submit} className="card-soft p-4 sm:p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Store Name</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.storeName || ''} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">WhatsApp Number (with country code)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Instagram Handle</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        {/* ───────── YouTube live ───────── */}
        <div className="pt-4 border-t">
          <h2 className="font-semibold text-sm">YouTube Live</h2>
          <p className="text-xs text-brand-ink/50 mb-3">
            Paste the YouTube live / video link for each day. Leave blank to hide that day on the website.
          </p>
          <div className="space-y-3">
            {LIVE_DAYS.map(([day, label]) => {
              const url = form.liveStreams[day].url;
              const invalid = url.trim() && !getYouTubeId(url);
              return (
                <div key={day} className="border rounded-lg p-3">
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    placeholder="Title (optional), e.g. Saree Collection Live – 8 PM"
                    value={form.liveStreams[day].title}
                    onChange={(e) => updateLive(day, { title: e.target.value })}
                  />
                  <input
                    className={`w-full border rounded-lg px-3 py-2 text-sm mt-2 ${invalid ? 'border-red-400' : ''}`}
                    placeholder="https://www.youtube.com/live/XXXXXXXXXXX"
                    value={url}
                    onChange={(e) => updateLive(day, { url: e.target.value })}
                  />
                  {invalid && <p className="text-xs text-red-500 mt-1">Not a valid YouTube link.</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────── Global shipping ───────── */}
        <div className="pt-4 border-t">
          <h2 className="font-semibold text-sm">Default shipping (all states)</h2>
          <p className="text-xs text-brand-ink/50">
            Applies to every state that doesn&apos;t have its own rule below. Total weight = pieces in cart × weight per piece.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Weight per Piece (grams)</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              value={form.weightPerPiece ?? 0}
              onChange={(e) => setForm({ ...form, weightPerPiece: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price per Kg (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              value={form.pricePerKg ?? 0}
              onChange={(e) => setForm({ ...form, pricePerKg: Number(e.target.value) })}
            />
          </div>
        </div>
        <p className="text-xs text-brand-ink/50 -mt-1">
          e.g. 250g per piece and ₹60/kg means a 3-piece order (750g) rounds up to 1kg → ₹60 shipping.
        </p>

        <div>
          <label className="text-sm font-medium">Default Shipping Charge (₹)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.defaultShippingCharge ?? 0}
            onChange={(e) => setForm({ ...form, defaultShippingCharge: Number(e.target.value) })}
          />
          <p className="text-xs text-brand-ink/50 mt-1">
            Used instead of the weight calculation if Weight per Piece or Price per Kg is 0.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Free Shipping Above (₹)</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.freeShippingAbove ?? 0} onChange={(e) => setForm({ ...form, freeShippingAbove: Number(e.target.value) })} />
          <p className="text-xs text-brand-ink/50 mt-1">0 disables free shipping.</p>
        </div>

        {/* ───────── State-wise shipping ───────── */}
        <div className="pt-4 border-t">
          <h2 className="font-semibold text-sm">State-wise shipping</h2>
          <p className="text-xs text-brand-ink/50 mb-3">
            Add a state to override the defaults for it. Leave a field blank to use the default above.
            Untick &quot;Deliver&quot; to stop orders to that state. Weight per piece is always global.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <select
              className="flex-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={stateToAdd}
              onChange={(e) => setStateToAdd(e.target.value)}
            >
              <option value="">Select a state…</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addStateRule}
              disabled={!stateToAdd}
              className="btn-primary text-sm flex items-center justify-center gap-1.5 py-2 px-4 whitespace-nowrap shrink-0 w-full sm:w-auto disabled:opacity-50"
            >
              <Plus size={15} />
              <span>Add state</span>
            </button>
          </div>

          {form.stateShipping.length === 0 ? (
            <p className="text-xs text-brand-ink/50">No state rules yet. All states use the default shipping.</p>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0 p-1">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-left text-xs text-brand-ink/60 border-b">
                    <th className="py-2 pr-2 font-medium">State</th>
                    <th className="py-2 px-2 font-medium">Deliver</th>
                    <th className="py-2 px-2 font-medium">₹ / kg</th>
                    <th className="py-2 px-2 font-medium">Flat ₹</th>
                    <th className="py-2 px-2 font-medium">Free above ₹</th>
                    <th className="py-2 pl-2" />
                  </tr>
                </thead>
                <tbody>
                  {form.stateShipping.map((r, idx) => (
                    <tr key={r.state} className="border-b align-middle" style={{ opacity: r.enabled === false ? 0.6 : 1 }}>
                      <td className="py-2 pr-2 whitespace-nowrap">{r.state}</td>
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={r.enabled !== false}
                          onChange={(e) => updateRule(idx, { enabled: e.target.checked })}
                        />
                      </td>
                      {['pricePerKg', 'defaultShippingCharge', 'freeShippingAbove'].map((field) => (
                        <td key={field} className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="default"
                            disabled={r.enabled === false}
                            className="w-24 border rounded-lg px-2 py-1 text-sm disabled:bg-neutral-50"
                            value={r[field] ?? ''}
                            onChange={(e) => updateRule(idx, { [field]: numOrNull(e.target.value) })}
                          />
                        </td>
                      ))}
                      <td className="py-2 pl-2">
                        <button type="button" onClick={() => removeRule(idx)} className="text-brand-magenta" title="Remove rule">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ───────── International Shipping ───────── */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="font-semibold text-sm">International Shipping Configuration</h2>
              <p className="text-xs text-brand-ink/50">
                Configure international delivery destinations, shipping fees, and payment availability.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium shrink-0">
              <input
                type="checkbox"
                checked={form.internationalShippingEnabled}
                onChange={(e) => setForm({ ...form, internationalShippingEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand-magenta"
              />
              Enable International Shipping
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="intlPayToggle"
              checked={form.internationalPaymentEnabled}
              onChange={(e) => setForm({ ...form, internationalPaymentEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-brand-magenta"
            />
            <label htmlFor="intlPayToggle" className="text-xs font-medium cursor-pointer">
              Enable International Payment method at checkout (for international customers)
            </label>
          </div>

          <div className="mt-4 p-3.5 bg-neutral-50 rounded-lg border space-y-3">
            <span className="text-xs font-semibold text-brand-ink/70 uppercase tracking-wider block">
              Add Country Destination
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Country Name *</label>
                <input
                  placeholder="e.g. USA, Canada, UAE"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newCountry.country}
                  onChange={(e) => setNewCountry({ ...newCountry, country: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Country Code (optional)</label>
                <input
                  placeholder="e.g. US, CA, AE"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white uppercase"
                  value={newCountry.countryCode}
                  onChange={(e) => setNewCountry({ ...newCountry, countryCode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Shipping Charge (₹) *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newCountry.shippingCharge}
                  onChange={(e) => setNewCountry({ ...newCountry, shippingCharge: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Free Above (₹, optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10000"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newCountry.freeShippingAbove}
                  onChange={(e) => setNewCountry({ ...newCountry, freeShippingAbove: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addCountryRule}
                disabled={!newCountry.country.trim()}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} /> Add Country Destination
              </button>
            </div>
          </div>

          {form.internationalShipping.length === 0 ? (
            <p className="text-xs text-brand-ink/50 mt-3">No international country destinations configured yet.</p>
          ) : (
            <div className="overflow-x-auto mt-3 -mx-2 sm:mx-0 p-1">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-xs text-brand-ink/60 border-b">
                    <th className="py-2 pr-2 font-medium">Country</th>
                    <th className="py-2 px-2 font-medium">Code</th>
                    <th className="py-2 px-2 font-medium">Deliver</th>
                    <th className="py-2 px-2 font-medium">Shipping Charge (₹)</th>
                    <th className="py-2 px-2 font-medium">Free Above (₹)</th>
                    <th className="py-2 pl-2" />
                  </tr>
                </thead>
                <tbody>
                  {form.internationalShipping.map((r, idx) => (
                    <tr key={r.country} className="border-b align-middle" style={{ opacity: r.enabled === false ? 0.6 : 1 }}>
                      <td className="py-2 pr-2 whitespace-nowrap font-medium text-xs">{r.country}</td>
                      <td className="py-2 px-2 text-xs uppercase text-brand-ink/60">{r.countryCode || '-'}</td>
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={r.enabled !== false}
                          onChange={(e) => updateCountryRule(idx, { enabled: e.target.checked })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          disabled={r.enabled === false}
                          className="w-28 border rounded-lg px-2 py-1 text-xs"
                          value={r.shippingCharge ?? ''}
                          onChange={(e) => updateCountryRule(idx, { shippingCharge: Math.max(0, Number(e.target.value) || 0) })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="No free shipping"
                          disabled={r.enabled === false}
                          className="w-28 border rounded-lg px-2 py-1 text-xs"
                          value={r.freeShippingAbove ?? ''}
                          onChange={(e) => updateCountryRule(idx, { freeShippingAbove: numOrNull(e.target.value) })}
                        />
                      </td>
                      <td className="py-2 pl-2">
                        <button type="button" onClick={() => removeCountryRule(idx)} className="text-brand-magenta cursor-pointer p-1" title="Remove country">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ───────── Wholesale Quantity Discounts ───────── */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="font-semibold text-sm">Wholesale / Bulk Purchase Discounts</h2>
              <p className="text-xs text-brand-ink/50">
                Reward customers with quantity-based discount tiers when purchasing multiple pieces.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium shrink-0">
              <input
                type="checkbox"
                checked={form.wholesaleDiscountsEnabled}
                onChange={(e) => setForm({ ...form, wholesaleDiscountsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand-magenta"
              />
              Enable Wholesale Discounts
            </label>
          </div>

          <div className="mt-4 p-3.5 bg-neutral-50 rounded-lg border space-y-3">
            <span className="text-xs font-semibold text-brand-ink/70 uppercase tracking-wider block">
              Add Discount Tier
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Min Pieces *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newTier.minQty}
                  onChange={(e) => setNewTier({ ...newTier, minQty: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Max Pieces (optional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10 (or blank)"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newTier.maxQty}
                  onChange={(e) => setNewTier({ ...newTier, maxQty: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Discount Type</label>
                <select
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newTier.discountType}
                  onChange={(e) => setNewTier({ ...newTier, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Discount Value *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10 for 10%"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newTier.discountValue}
                  onChange={(e) => setNewTier({ ...newTier, discountValue: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-brand-ink/70 block mb-1">Label (optional)</label>
                <input
                  placeholder="e.g. 10% off on 5+ pcs"
                  className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  value={newTier.description}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addWholesaleTier}
                disabled={!newTier.minQty || !newTier.discountValue}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} /> Add Discount Tier
              </button>
            </div>
          </div>

          {form.wholesaleTiers.length === 0 ? (
            <p className="text-xs text-brand-ink/50 mt-3">No wholesale discount tiers configured yet.</p>
          ) : (
            <div className="overflow-x-auto mt-3 -mx-2 sm:mx-0 p-1">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-xs text-brand-ink/60 border-b">
                    <th className="py-2 pr-2 font-medium">Min Qty</th>
                    <th className="py-2 px-2 font-medium">Max Qty</th>
                    <th className="py-2 px-2 font-medium">Type</th>
                    <th className="py-2 px-2 font-medium">Discount</th>
                    <th className="py-2 px-2 font-medium">Description</th>
                    <th className="py-2 pl-2" />
                  </tr>
                </thead>
                <tbody>
                  {form.wholesaleTiers.map((t, idx) => (
                    <tr key={idx} className="border-b align-middle">
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="1"
                          className="w-20 border rounded-lg px-2 py-1 text-xs"
                          value={t.minQty}
                          onChange={(e) => updateWholesaleTier(idx, { minQty: Math.max(1, Number(e.target.value) || 1) })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Unlimited"
                          className="w-20 border rounded-lg px-2 py-1 text-xs"
                          value={t.maxQty ?? ''}
                          onChange={(e) => updateWholesaleTier(idx, { maxQty: numOrNull(e.target.value) })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          className="border rounded-lg px-2 py-1 text-xs"
                          value={t.discountType}
                          onChange={(e) => updateWholesaleTier(idx, { discountType: e.target.value })}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed (₹)</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          className="w-24 border rounded-lg px-2 py-1 text-xs"
                          value={t.discountValue}
                          onChange={(e) => updateWholesaleTier(idx, { discountValue: Math.max(1, Number(e.target.value) || 0) })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          className="w-full min-w-[140px] border rounded-lg px-2 py-1 text-xs"
                          value={t.description || ''}
                          onChange={(e) => updateWholesaleTier(idx, { description: e.target.value })}
                        />
                      </td>
                      <td className="py-2 pl-2">
                        <button type="button" onClick={() => removeWholesaleTier(idx)} className="text-brand-magenta" title="Remove tier">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <label className="text-sm font-medium">SEO Title</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.seoTitle || ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">SEO Description</label>
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.seoDescription || ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
        </div>
        <button className="btn-primary text-sm">Save Settings</button>
      </form>
    </div>
  );
}