// ProductCard is a client component, so every field passed to it is serialized
// into the page HTML. The card needs each colour (for the swatches), the sizes
// with stock (for the quick-add chips) and ONE image per colour, so we send just
// that instead of the whole product document.

// Mongo projection that fetches exactly what the card reads.
export const CARD_SELECT = {
  slug: 1,
  name: 1,
  basePrice: 1,
  rating: 1,
  reviewCount: 1,
  description: 1,
  weight: 1,
  isBestSeller: 1,
  isTopSeller: 1,
  sleeveOptions: 1,
  zipOptions: 1,
  variants: 1,
};

export function toCardProduct(p) {
  const variants = (p.variants || []).slice(0, 8).map((v) => ({
    _id: v._id ? String(v._id) : undefined,
    color: v.color || v.title || '',
    colorHex: v.colorHex || '',
    price: v.price,
    compareAtPrice: v.compareAtPrice || v.originalPrice || 0,
    images: v.images?.slice(0, 1) || [],
    sizes: (v.sizes || []).map((s) => ({
      size: s.size,
      stock: s.stock ?? 0,
      price: s.price ?? null,
    })),
  }));

  return {
    _id: String(p._id),
    slug: p.slug,
    name: p.name,
    basePrice: p.basePrice,
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    description: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 90),
    weight: p.weight || 0,
    isBestSeller: !!p.isBestSeller,
    // Sleeve / zip are mandatory choices on the product page, so the card
    // sends the shopper there instead of adding a half-configured item.
    needsOptions: !!(p.sleeveOptions?.length || p.zipOptions?.length),
    variants,
  };
}
