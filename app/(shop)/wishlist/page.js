'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '@/components/WhishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      if (!wishlist?.length) {
        if (active) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: wishlist }),
        });
        const data = await res.json();
        if (active) setProducts(data.products || []);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      active = false;
    };
  }, [wishlist]);

  return (
    <div className="bg-[#F5F0E9] min-h-[70vh] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E9DFD9] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B98270] mb-2">
              <Sparkles size={12} className="text-[#BFA078]" />
              Personal Curation
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#172333]">
              My Saved Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#77716F] font-light mt-1">
              Your favorite boutique designs, saved in one place for effortless shopping.
            </p>
          </div>

          <div className="text-xs text-[#77716F] bg-white px-3.5 py-1.5 rounded-full border border-[#E9DFD9] self-start sm:self-end">
            <strong className="text-[#172333] font-semibold">{products.length}</strong> {products.length === 1 ? 'Design' : 'Designs'} Saved
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-white/60 animate-pulse border border-[#E9DFD9]" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-[#E9DFD9] p-8 max-w-lg mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-[#F4E8E3] flex items-center justify-center mx-auto mb-4 text-[#B98270]">
              <Heart size={26} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#172333]">Your Wishlist is Empty</h3>
            <p className="text-xs sm:text-sm text-[#77716F] mt-2 font-light max-w-xs mx-auto leading-relaxed">
              Tap the heart icon on any design in our collection to save it for later.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#172333] hover:bg-[#B98270] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
