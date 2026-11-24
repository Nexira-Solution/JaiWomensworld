'use client';

import { useEffect, useState } from 'react';
import { Tag, Sparkles } from 'lucide-react';

const BG = '#12233F';                       // Deep navy bar
const TEXT = '#FFF4F3';                     // Ivory text
const ACCENT = '#D9A441';                   // Gold accent
const ROSE = '#F4A7BA';                     // Blush accent

export default function CouponMarquee() {
  const [coupons, setCoupons] = useState([]);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);

  useEffect(() => {
    fetch('/api/coupons?active=true')
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {});

    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setFreeShippingAbove(d.settings?.freeShippingAbove ?? null))
      .catch(() => {});
  }, []);

  const freeShippingItem =
    freeShippingAbove != null ? { type: 'freeshipping', minOrderValue: freeShippingAbove } : null;

  const allItems = freeShippingItem ? [...coupons, freeShippingItem] : coupons;
  if (!allItems.length) return null;

  const items = [...allItems, ...allItems, ...allItems];

  return (
    <div className="relative overflow-hidden py-2.5 border-b border-[#D9A441]/20" style={{ background: BG }}>
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
        style={{ background: `linear-gradient(to right, ${BG}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
        style={{ background: `linear-gradient(to left, ${BG}, transparent)` }}
      />

      <div className="flex animate-marquee whitespace-nowrap w-max select-none">
        {items.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-6 text-[11px] sm:text-xs tracking-[0.1em] uppercase font-light"
            style={{ color: TEXT }}
          >
            <Sparkles size={11} className="text-[#D9A441]" />
            {c.type === 'freeshipping' ? (
              <span>
                Complimentary Shipping on Orders Above{' '}
                <strong className="font-semibold text-[#D9A441]">₹{c.minOrderValue}</strong>
              </span>
            ) : (
              <span>
                Use Code <span className="font-semibold text-white tracking-widest px-1.5 py-0.5 rounded bg-white/10">{c.code}</span> for{' '}
                <strong className="font-semibold text-[#D9A441]">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </strong>
                {c.minOrderValue > 0 && ` (Min ₹${c.minOrderValue})`}
              </span>
            )}
            <span className="mx-4 text-[#F4A7BA]/40">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
