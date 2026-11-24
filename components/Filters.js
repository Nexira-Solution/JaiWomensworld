'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function Filters({
  categories = [],
  currentCategory = 'all',
  currentArrival = 'all',
  currentSort = 'newest',
  sort,
  onSortChange,
  total = 0,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // If setting sort to default ('newest'), remove sort param
    if (key === 'sort' && value === 'newest') {
      params.delete('sort');
    }
    params.set('page', '1');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  // Support single-sort mode when used on category pages without category list
  if (categories.length === 0) {
    const activeSort = sort || currentSort;
    const handleSort = (v) => {
      if (typeof onSortChange === 'function') {
        onSortChange(v);
      } else {
        updateParam('sort', v);
      }
    };

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 px-4 mb-6 rounded-xl bg-white border border-[#F5D5DB] shadow-xs relative z-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#12233F] font-semibold">
          <SlidersHorizontal size={14} className="text-[#B02F5E]" />
          <span>Sort Collection</span>
        </div>
        <div className="w-full sm:w-56">
          <CustomDropdown
            options={[
              { value: 'newest', label: 'Newest Arrivals' },
              { value: 'bestselling', label: 'Most Loved / Popular' },
              { value: 'priceLow', label: 'Price: Low to High' },
              { value: 'priceHigh', label: 'Price: High to Low' },
            ]}
            value={activeSort}
            onChange={handleSort}
          />
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentArrival !== 'all' ||
    (currentSort !== 'newest' && currentSort !== 'recommended');

  const activeCount = [
    currentCategory !== 'all',
    currentArrival !== 'all',
    currentSort !== 'newest' && currentSort !== 'recommended',
  ].filter(Boolean).length;

  // Options configuration
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name,
    })),
  ];

  const arrivalOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'new', label: 'New Arrivals' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Recommended' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#F5D5DB] p-4 sm:p-5 mb-8 shadow-[0_4px_20px_-10px_rgba(107,24,56,0.08)] relative z-20 overflow-visible">
      {/* Header bar: Title & Reset Button */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F5D5DB]/80 mb-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#12233F]">
          <SlidersHorizontal size={15} className="text-[#B02F5E]" />
          <span>Filter &amp; Sort</span>
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B02F5E] text-white">
              {activeCount} active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B02F5E] hover:text-[#12233F] transition-colors px-3 py-1.5 rounded-full bg-[#FFF4F3] border border-[#F5D5DB] hover:border-[#B02F5E]"
          >
            <RotateCcw size={12} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* 3-Column Filter Controls Grid (Full width on mobile, 3 columns on tablet/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
        {/* A. Category Filter */}
        <CustomDropdown
          label="Category"
          options={categoryOptions}
          value={currentCategory}
          onChange={(val) => updateParam('category', val)}
        />

        {/* B. Arrival Filter */}
        <CustomDropdown
          label="Arrivals"
          options={arrivalOptions}
          value={currentArrival}
          onChange={(val) => updateParam('arrival', val)}
        />

        {/* C. Price Sorting */}
        <CustomDropdown
          label="Sort By"
          options={sortOptions}
          value={currentSort}
          onChange={(val) => updateParam('sort', val)}
        />
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-[#F5D5DB]/60">
          <span className="text-[11px] text-[#7B5D69] font-medium mr-1">Active Filters:</span>

          {currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#FFF4F3] border border-[#F5D5DB] text-[#12233F]">
              <span>Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}</span>
              <button
                type="button"
                onClick={() => updateParam('category', 'all')}
                className="hover:text-[#B02F5E] p-0.5"
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {currentArrival === 'new' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#FFF4F3] border border-[#F5D5DB] text-[#12233F]">
              <Sparkles size={11} className="text-[#D9A441]" />
              <span>New Arrivals</span>
              <button
                type="button"
                onClick={() => updateParam('arrival', 'all')}
                className="hover:text-[#B02F5E] p-0.5"
                aria-label="Remove arrival filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {currentSort !== 'newest' && currentSort !== 'recommended' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#FFF4F3] border border-[#F5D5DB] text-[#12233F]">
              <span>
                Sort:{' '}
                {currentSort === 'priceLow'
                  ? 'Price: Low to High'
                  : currentSort === 'priceHigh'
                  ? 'Price: High to Low'
                  : currentSort}
              </span>
              <button
                type="button"
                onClick={() => updateParam('sort', 'newest')}
                className="hover:text-[#B02F5E] p-0.5"
                aria-label="Reset sort"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#B02F5E] hover:underline ml-auto font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
