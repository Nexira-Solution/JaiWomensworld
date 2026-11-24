'use client';

import { useEffect, useState } from 'react';
import RelatedProducts from '@/components/RelatedProducts';
import { useCart } from '@/components/CartContext';
import { toCardProduct } from '@/lib/cardProduct';

// "Complete your look" row for the cart page. Best sellers first; falls back to
// newest products when no best sellers are flagged. Hides anything already in the bag.
export default function CartRecommendations() {
  const { items } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let res = await fetch('/api/products?flag=bestseller&limit=12');
        let data = await res.json();
        if (!data.products?.length) {
          res = await fetch('/api/products?sort=newest&limit=12');
          data = await res.json();
        }
        if (!cancelled) setProducts(data.products || []);
      } catch {
        /* recommendations are optional: fail quietly */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const inBag = new Set(items.map((i) => String(i.productId)));
  const cards = products.filter((p) => !inBag.has(String(p._id))).slice(0, 10).map(toCardProduct);
  if (!cards.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <RelatedProducts
        items={cards}
        title="Complete Your Look"
        subtitle="Customers who bought these also loved"
      />
    </div>
  );
}
