// lib/wholesale.js
// Single source of truth for wholesale quantity discounts calculation.
// Used by:
//   - lib/orderCalc.js (server quote & order creation)
//   - app/api/admin/settings/route.js
//   - storefront cart & checkout display

export function computeWholesaleDiscount(settings, { subtotal = 0, totalPieces = 0 }) {
  if (!settings?.wholesaleDiscountsEnabled) {
    return {
      enabled: false,
      discount: 0,
      tier: null,
      nextTier: null,
      piecesNeededForNextTier: 0,
    };
  }

  const tiers = Array.isArray(settings.wholesaleTiers)
    ? [...settings.wholesaleTiers].filter((t) => Number(t?.minQty) > 0 && Number(t?.discountValue) > 0)
    : [];

  if (tiers.length === 0) {
    return {
      enabled: false,
      discount: 0,
      tier: null,
      nextTier: null,
      piecesNeededForNextTier: 0,
    };
  }

  // Sort tiers by minQty ascending
  tiers.sort((a, b) => Number(a.minQty) - Number(b.minQty));

  const pieces = Number(totalPieces) || 0;
  const numSubtotal = Math.max(0, Number(subtotal) || 0);

  // Find all eligible tiers
  const eligibleTiers = tiers.filter((t) => {
    const min = Number(t.minQty);
    const max = t.maxQty !== null && t.maxQty !== undefined && t.maxQty !== '' ? Number(t.maxQty) : Infinity;
    return pieces >= min && pieces <= max;
  });

  // Pick highest eligible tier (the one with the largest minQty or highest discount)
  let bestTier = null;
  let bestDiscount = 0;

  for (const t of eligibleTiers) {
    let d = 0;
    if (t.discountType === 'percentage') {
      d = Math.round((numSubtotal * Number(t.discountValue)) / 100);
    } else {
      d = Math.min(numSubtotal, Number(t.discountValue));
    }
    if (d >= bestDiscount) {
      bestDiscount = d;
      bestTier = t;
    }
  }

  // Find next tier to unlock
  const nextTier = tiers.find((t) => Number(t.minQty) > pieces) || null;
  const piecesNeededForNextTier = nextTier ? Number(nextTier.minQty) - pieces : 0;

  return {
    enabled: true,
    discount: bestDiscount,
    tier: bestTier
      ? {
          minQty: bestTier.minQty,
          maxQty: bestTier.maxQty,
          discountType: bestTier.discountType,
          discountValue: bestTier.discountValue,
          description:
            bestTier.description ||
            `${bestTier.discountValue}${bestTier.discountType === 'percentage' ? '%' : '₹'} off on ${bestTier.minQty}+ pieces`,
        }
      : null,
    nextTier: nextTier
      ? {
          minQty: nextTier.minQty,
          maxQty: nextTier.maxQty,
          discountType: nextTier.discountType,
          discountValue: nextTier.discountValue,
          description:
            nextTier.description ||
            `${nextTier.discountValue}${nextTier.discountType === 'percentage' ? '%' : '₹'} off on ${nextTier.minQty}+ pieces`,
        }
      : null,
    piecesNeededForNextTier,
  };
}
