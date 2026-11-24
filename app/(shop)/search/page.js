'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, PackageOpen, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="bg-[#FFF4F3] min-h-[70vh] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#F5D5DB] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-1">
              Search Results
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#12233F]">
              {q ? `Results for “${q}”` : 'Search Collection'}
            </h1>
          </div>

          <div className="text-xs text-[#7B5D69] bg-white px-3.5 py-1.5 rounded-full border border-[#F5D5DB] self-start sm:self-end">
            <strong className="text-[#12233F] font-semibold">{products.length}</strong> {products.length === 1 ? 'Design' : 'Designs'} Found
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-white/60 animate-pulse border border-[#F5D5DB]" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-[#F5D5DB] p-8 max-w-lg mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-[#FCE4E8] flex items-center justify-center mx-auto mb-4 text-[#B02F5E]">
              <Search size={26} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#12233F]">No Matches Found</h3>
            <p className="text-xs sm:text-sm text-[#7B5D69] mt-2 font-light max-w-xs mx-auto leading-relaxed">
              We couldn&rsquo;t find any designs matching &ldquo;{q}&rdquo;. Try searching for kurtis, salwar, or umbrella sets.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique"
            >
              <span>Browse All Collections</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="bg-[#FFF4F3] min-h-[60vh] flex items-center justify-center text-xs uppercase tracking-wider text-[#7B5D69]">Loading results…</div>}>
      <SearchResults />
    </Suspense>
  );
}
