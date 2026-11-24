'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function Filters({ sort, onSortChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value) => {
    if (typeof onSortChange === 'function') {
      onSortChange(value);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', value);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center justify-between py-3.5 px-4 mb-6 rounded-md bg-white border border-[#F5D5DB]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#7B5D69] font-medium">
        <SlidersHorizontal size={14} className="text-[#B02F5E]" />
        <span>Sort &amp; Filter</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[#7B5D69]">
          Arrange:
        </span>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => handleChange(e.target.value)}
            className="appearance-none bg-transparent outline-none text-xs font-medium text-[#171717] pr-6 py-1 cursor-pointer focus:text-[#B02F5E]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="bestselling">Most Loved / Popular</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
          <ChevronDown
            size={13}
            strokeWidth={1.5}
            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#7B5D69]"
          />
        </div>
      </div>
    </div>
  );
}
