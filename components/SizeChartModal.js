'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Ruler, Table, Image as ImageIcon } from 'lucide-react';

// Dress-code specific size chart configurations
function getDressSizeConfig(category, customTable) {
  // If backend provided a custom structured table for this dress/category, use it directly
  if (Array.isArray(customTable) && customTable.length > 0) {
    const sample = customTable[0] || {};
    const cols = [{ key: 'size', label: 'Size' }];
    if ('bust' in sample || 'chest' in sample) cols.push({ key: 'bust', label: 'Bust / Chest' });
    if ('waist' in sample) cols.push({ key: 'waist', label: 'Waist' });
    if ('hip' in sample) cols.push({ key: 'hip', label: 'Hip' });
    if ('length' in sample) cols.push({ key: 'length', label: 'Length' });
    if ('shoulder' in sample) cols.push({ key: 'shoulder', label: 'Shoulder' });

    return {
      dressType: category?.name || 'Custom Sizing',
      columns: cols,
      rows: customTable.map((r) => ({
        size: r.size,
        bust: r.bust || r.chest,
        waist: r.waist,
        hip: r.hip,
        length: r.length,
        shoulder: r.shoulder,
      })),
    };
  }

  const name = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();

  // 1. Nighties / Loungewear
  if (/nighty|nighties|night|sleep|lounge/i.test(name)) {
    return {
      dressType: category?.name || 'Nighties & Sleepwear',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'chest', label: 'Chest / Bust' },
        { key: 'length', label: 'Full Length' },
        { key: 'flare', label: 'Bottom Flare' },
      ],
      rows: [
        { size: 'M', chest: 38, length: 54, flare: 64 },
        { size: 'L', chest: 40, length: 54, flare: 66 },
        { size: 'XL', chest: 42, length: 55, flare: 68 },
        { size: 'XXL', chest: 44, length: 55, flare: 70 },
        { size: 'Free Size', chest: 42, length: 54, flare: 68 },
      ],
    };
  }

  // 2. Salwar Suits / 2 Piece Sets / 3 Piece Sets / Churidars
  if (/salwar|churidar|suit|2 piece|2-piece|3 piece|set/i.test(name)) {
    return {
      dressType: category?.name || 'Salwar & 2-Piece Sets',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'bust', label: 'Kurta Bust' },
        { key: 'kLength', label: 'Kurta Length' },
        { key: 'waist', label: 'Pant Waist' },
        { key: 'pLength', label: 'Pant Length' },
      ],
      rows: [
        { size: 'S', bust: 36, kLength: 42, waist: 28, pLength: 38 },
        { size: 'M', bust: 38, kLength: 43, waist: 30, pLength: 38 },
        { size: 'L', bust: 40, kLength: 43, waist: 32, pLength: 39 },
        { size: 'XL', bust: 42, kLength: 44, waist: 34, pLength: 39 },
        { size: 'XXL', bust: 44, kLength: 44, waist: 36, pLength: 40 },
        { size: '3XL', bust: 46, kLength: 44, waist: 38, pLength: 40 },
      ],
    };
  }

  // 3. T-Shirts / Casual Tops
  if (/tshirt|t-shirt|t shirt|tee/i.test(name)) {
    return {
      dressType: category?.name || 'T-Shirts & Tops',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'chest', label: 'Chest' },
        { key: 'length', label: 'Length' },
        { key: 'shoulder', label: 'Shoulder' },
        { key: 'sleeve', label: 'Sleeve' },
      ],
      rows: [
        { size: 'S', chest: 36, length: 26, shoulder: 15, sleeve: 7.5 },
        { size: 'M', chest: 38, length: 27, shoulder: 16, sleeve: 8 },
        { size: 'L', chest: 40, length: 28, shoulder: 17, sleeve: 8.5 },
        { size: 'XL', chest: 42, length: 29, shoulder: 18, sleeve: 9 },
        { size: 'XXL', chest: 44, length: 30, shoulder: 19, sleeve: 9.5 },
      ],
    };
  }

  // 4. Sarees
  if (/saree|sari/i.test(name)) {
    return {
      dressType: category?.name || 'Sarees',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'sLength', label: 'Saree Length' },
        { key: 'blouse', label: 'Blouse Piece' },
        { key: 'width', label: 'Width' },
      ],
      rows: [
        { size: 'Free Size', sLength: '5.5 Meters', blouse: '0.8 Meters (Unstitched)', width: '44 Inches', isText: true },
      ],
    };
  }

  // 5. Bottoms / Pants / Leggings / Palazzos / Inners
  if (/inner|bottom|pant|palazzo|legging/i.test(name)) {
    return {
      dressType: category?.name || 'Pants & Bottomwear',
      columns: [
        { key: 'size', label: 'Size' },
        { key: 'waist', label: 'Waist' },
        { key: 'hip', label: 'Hip' },
        { key: 'length', label: 'Length' },
      ],
      rows: [
        { size: 'S', waist: 26, hip: 34, length: 37 },
        { size: 'M', waist: 28, hip: 36, length: 38 },
        { size: 'L', waist: 30, hip: 38, length: 38 },
        { size: 'XL', waist: 32, hip: 40, length: 39 },
        { size: 'XXL', waist: 34, hip: 42, length: 39 },
        { size: 'Free Size', waist: 28, hip: 38, length: 38 },
      ],
    };
  }

  // 6. Default: Kurtis (Side Open Kurtis, Umbrella Kurtis, Anarkali, Straight Cut, etc.)
  return {
    dressType: category?.name || 'Kurtis & Tunics',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'bust', label: 'Bust / Chest' },
      { key: 'waist', label: 'Waist' },
      { key: 'hip', label: 'Hip' },
      { key: 'length', label: 'Kurti Length' },
      { key: 'shoulder', label: 'Shoulder' },
    ],
    rows: [
      { size: 'XS', bust: 34, waist: 30, hip: 36, length: 42, shoulder: 13.5 },
      { size: 'S',  bust: 36, waist: 32, hip: 38, length: 42, shoulder: 14.0 },
      { size: 'M',  bust: 38, waist: 34, hip: 40, length: 43, shoulder: 14.5 },
      { size: 'L',  bust: 40, waist: 36, hip: 42, length: 43, shoulder: 15.0 },
      { size: 'XL', bust: 42, waist: 38, hip: 44, length: 44, shoulder: 15.5 },
      { size: 'XXL', bust: 44, waist: 40, hip: 46, length: 44, shoulder: 16.0 },
      { size: '3XL', bust: 46, waist: 42, hip: 48, length: 44, shoulder: 16.5 },
    ],
  };
}

export default function SizeChartModal({
  images = [],
  category = null,
  productName = '',
  customTable = null,
  availableSizes = [],
  onClose,
}) {
  const hasImages = Array.isArray(images) && images.length > 0;
  const [activeTab, setActiveTab] = useState(hasImages ? 'image' : 'table');
  const [imgIndex, setImgIndex] = useState(0);
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  const sizeConfig = getDressSizeConfig(category, customTable);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const prev = () => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const formatValue = (val, isText = false) => {
    if (isText || typeof val === 'string') return val;
    if (typeof val === 'number') {
      if (unit === 'cm') {
        return `${Math.round(val * 2.54)} cm`;
      }
      return `${val}"`;
    }
    return val || '-';
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-[#12233F]/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#F5D5DB] overflow-hidden mx-1 sm:mx-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#F5D5DB] bg-[#FFF4F3]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-[#FCE4E8] flex items-center justify-center text-[#B02F5E] shrink-0">
              <Ruler size={16} />
            </div>
            <div className="min-w-0">
              <h2 id="size-chart-title" className="font-display font-bold text-base sm:text-lg md:text-xl text-[#12233F] truncate">
                {sizeConfig.dressType} Size Chart
              </h2>
              <p className="text-[11px] sm:text-xs text-[#7B5D69] truncate">
                {productName ? `${productName} · ` : ''}Tailored for {sizeConfig.dressType} fit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7B5D69] hover:text-[#12233F] hover:bg-white border border-transparent hover:border-[#F5D5DB] transition-all cursor-pointer shrink-0"
            aria-label="Close size chart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs - Always visible across all devices */}
        <div className="flex border-b border-[#F5D5DB] bg-white px-4 sm:px-6 pt-3 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'image'
                ? 'border-[#B02F5E] text-[#B02F5E]'
                : 'border-transparent text-[#7B5D69] hover:text-[#12233F]'
            }`}
          >
            <ImageIcon size={15} />
            <span>Chart Image{hasImages ? ` (${images.length})` : ''}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'table'
                ? 'border-[#B02F5E] text-[#B02F5E]'
                : 'border-transparent text-[#7B5D69] hover:text-[#12233F]'
            }`}
          >
            <Table size={15} />
            <span>{sizeConfig.dressType} Table</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar space-y-4">
          {/* View 1: Chart Image View */}
          {activeTab === 'image' && (
            hasImages ? (
              <div className="space-y-3">
                <div className="relative w-full min-h-[260px] sm:min-h-[400px] max-h-[58vh] bg-[#FFF4F3] rounded-xl border border-[#F5D5DB] overflow-hidden flex items-center justify-center">
                  <Image
                    src={images[imgIndex]}
                    alt={`Size chart ${imgIndex + 1} of ${images.length}`}
                    width={800}
                    height={800}
                    className="w-full h-auto max-h-[56vh] object-contain p-2"
                    priority
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prev}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-[#12233F] shadow-md border border-[#F5D5DB] flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Previous chart image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-[#12233F] shadow-md border border-[#F5D5DB] flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Next chart image"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 right-3 text-[11px] sm:text-xs px-2.5 py-1 rounded bg-[#12233F]/80 text-white font-medium">
                        {imgIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-center text-[#7B5D69]">
                  Official size table from Jai Womens World. Swipe or use buttons to view more if available.
                </p>
              </div>
            ) : (
              /* Clean Empty State when no size chart images are configured */
              <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 text-center min-h-[260px] sm:min-h-[340px] bg-[#FFF4F3]/50 rounded-xl border border-dashed border-[#F5D5DB]">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FCE4E8] flex items-center justify-center text-[#B02F5E] mb-3">
                  <ImageIcon size={26} />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-[#12233F] mb-1.5">
                  No Size Chart Images Available
                </h3>
                <p className="text-xs sm:text-sm text-[#7B5D69] max-w-sm mb-4 leading-relaxed">
                  A visual measurement diagram image is not uploaded for this product. Please refer to the {sizeConfig.dressType} Table for complete measurement details.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#12233F] hover:bg-[#B02F5E] text-white transition-all cursor-pointer shadow-xs"
                >
                  <Table size={14} />
                  <span>View {sizeConfig.dressType} Table</span>
                </button>
              </div>
            )
          )}

          {/* View 2: Dress Code Measurement Table */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              {/* Unit Switcher */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#12233F] truncate">
                  {sizeConfig.dressType} Measurements ({unit === 'in' ? 'Inches' : 'Centimeters'})
                </p>
                <div className="inline-flex rounded-lg border border-[#F5D5DB] p-0.5 bg-[#FFF4F3] text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      unit === 'in' ? 'bg-[#12233F] text-white shadow-xs' : 'text-[#7B5D69] hover:text-[#12233F]'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      unit === 'cm' ? 'bg-[#12233F] text-white shadow-xs' : 'text-[#7B5D69] hover:text-[#12233F]'
                    }`}
                  >
                    CM
                  </button>
                </div>
              </div>

              {/* Table with responsive horizontal scrolling */}
              <div className="overflow-x-auto rounded-xl border border-[#F5D5DB] shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm min-w-[340px] sm:min-w-[460px]">
                  <thead className="bg-[#FFF4F3] text-[#12233F] uppercase tracking-wider font-semibold border-b border-[#F5D5DB]">
                    <tr>
                      {sizeConfig.columns.map((col) => (
                        <th key={col.key} className="py-2.5 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5D5DB] bg-white">
                    {sizeConfig.rows.map((row, idx) => {
                      const isAvailable = availableSizes.includes(row.size);
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-[#FFF4F3]/60 transition-colors ${
                            isAvailable ? 'font-medium text-[#12233F]' : 'text-[#7B5D69]'
                          }`}
                        >
                          {sizeConfig.columns.map((col) => {
                            if (col.key === 'size') {
                              return (
                                <td key={col.key} className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-[#12233F] whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{row.size}</span>
                                    {isAvailable && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FCE4E8] text-[#B02F5E] font-semibold uppercase">
                                        In Stock
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td key={col.key} className="py-2.5 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                                {formatValue(row[col.key], row.isText)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#F5D5DB] bg-white flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#7B5D69] truncate">
            {sizeConfig.dressType} · Sizing provided directly by Jai Womens World.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#12233F] hover:bg-[#B02F5E] text-white transition-all cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
