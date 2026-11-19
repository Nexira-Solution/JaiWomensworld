'use client';

// Design tokens — JAI WOMENS WORLD brand palette
const INK = '#171717';
const INK_SOFT = '#77716F';
const NAVY = '#172333';
const ROSE = '#B98270';
const LINE = '#E9DFD9';
const PAPER = '#FFFFFF';
const WASH = '#F4E8E3';
const DISABLED = '#C2B8B2';

function AddonSelector({ label, options, activeId, onChange, formatINR }) {
  if (!options?.length) return null;
  const active = options.find((o) => o._id === activeId);

  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: INK_SOFT }}>
        {label}
      </p>
      <div className="flex gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => onChange('')}
          className="h-9 px-3 text-xs uppercase tracking-wider font-medium transition-colors"
          style={{
            borderRadius: '4px',
            border: `1px solid ${!activeId ? NAVY : LINE}`,
            background: !activeId ? NAVY : PAPER,
            color: !activeId ? '#FFFFFF' : INK,
          }}
        >
          None
        </button>

        {options.map((opt) => {
          const outOfStock = (opt.stock ?? 0) <= 0;
          const isActive = activeId === opt._id;
          return (
            <button
              key={opt._id}
              type="button"
              disabled={outOfStock}
              onClick={() => onChange(opt._id)}
              className="flex items-center gap-2 h-9 pl-1.5 pr-3 text-xs uppercase tracking-wider font-medium transition-colors"
              style={{
                borderRadius: '4px',
                border: `1px solid ${outOfStock ? LINE : isActive ? NAVY : LINE}`,
                background: isActive ? NAVY : PAPER,
                color: outOfStock ? DISABLED : isActive ? '#FFFFFF' : INK,
                textDecoration: outOfStock ? 'line-through' : 'none',
                cursor: outOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              {opt.image && (
                <span
                  className="w-6 h-6 rounded-xs overflow-hidden shrink-0"
                  style={{ background: WASH }}
                >
                  <img src={opt.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </span>
              )}
              {opt.name}
              {opt.price > 0 && (
                <span style={{ opacity: 0.8 }}>+{formatINR(opt.price)}</span>
              )}
            </button>
          );
        })}
      </div>

      {active?.image && (
        <div className="mt-2.5 w-16 h-16 rounded-md overflow-hidden border border-[#E9DFD9]" style={{ background: WASH }}>
          <img src={active.image} alt={active.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      )}
      {active && active.stock > 0 && active.stock <= 5 && (
        <p className="mt-2 text-xs font-medium" style={{ color: ROSE }}>
          Only {active.stock} left in stock
        </p>
      )}
    </div>
  );
}

export default function ColorSizeSelector({
  variants,
  activeVariant,
  onColorChange,
  activeSize,
  onSizeChange,
  categoryType,
  sizeChartImages,
  onViewSizeChart,
  sleeveOptions,
  activeSleeve,
  onSleeveChange,
  zipOptions,
  activeZip,
  onZipChange,
  pantOptions,
  activePantId,
  onPantChange,
  shawlOptions,
  activeShawlId,
  onShawlChange,
  formatINR,
}) {
  const isJewellery = categoryType === 'jewellery';
  const sizeStock = (size) => activeVariant?.sizes?.find((s) => s.size === size)?.stock ?? 0;

  const variantPrice = Number(activeVariant?.price) || 0;
  const priceOfSize = (s) => (Number(s?.price) > 0 ? Number(s.price) : variantPrice);
  const showSizePrices = !!activeVariant?.sizes?.some((s) => priceOfSize(s) !== variantPrice);

  const hasColors = variants?.some((v) => v.color && v.color.trim());
  const hasSizeChart = Array.isArray(sizeChartImages) && sizeChartImages.length > 0;
  const hasSleeveOptions = Array.isArray(sleeveOptions) && sleeveOptions.length > 0;
  const hasZipOptions = Array.isArray(zipOptions) && zipOptions.length > 0;

  return (
    <div className="space-y-6">

      {/* Color selector */}
      {hasColors && (
        <div>
          <p className="text-xs uppercase tracking-wider mb-2.5 font-medium" style={{ color: INK_SOFT }}>
            {isJewellery ? 'Material/Colour' : 'Color'}
            {' '}
            <span className="font-semibold text-[#171717] normal-case">({activeVariant?.color})</span>
          </p>

          <div className="flex gap-2.5 flex-wrap">
            {variants.map((v) => {
              const isActive = activeVariant?._id === v._id;
              return (
                <button
                  key={v._id}
                  onClick={() => onColorChange(v)}
                  title={v.color}
                  aria-label={v.color}
                  aria-pressed={isActive}
                  className="relative w-8 h-8 rounded-full transition-all border border-[#172333]/20"
                  style={{
                    backgroundColor: v.colorHex || '#ccc',
                    boxShadow: isActive ? '0 0 0 2px #FFFFFF, 0 0 0 3.5px #172333' : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: INK_SOFT }}>
            {isJewellery ? 'Ring/Bangle Size' : 'Select Size'}
          </p>
          {hasSizeChart && (
            <button
              type="button"
              onClick={onViewSizeChart}
              className="text-xs font-semibold text-[#B98270] hover:underline uppercase tracking-wider"
            >
              Size Guide
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {activeVariant?.sizes?.map((s) => {
            const outOfStock = s.stock <= 0;
            const active = activeSize === s.size;
            return (
              <button
                key={s.size}
                disabled={outOfStock}
                onClick={() => onSizeChange(s.size)}
                className={`${showSizePrices ? 'min-w-[64px] h-[48px] px-3 flex flex-col items-center justify-center leading-tight' : 'min-w-[42px] h-[38px] px-3'} text-xs font-semibold uppercase tracking-wider transition-all`}
                style={{
                  borderRadius: '4px',
                  border: `1px solid ${outOfStock ? LINE : active ? NAVY : LINE}`,
                  background: active ? NAVY : PAPER,
                  color: outOfStock ? DISABLED : active ? '#FFFFFF' : INK,
                  textDecoration: outOfStock ? 'line-through' : 'none',
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{s.size}</span>
                {showSizePrices && (
                  <span className={`text-[10px] font-normal ${active ? 'text-white/80' : 'text-[#77716F]'}`}>
                    {formatINR(priceOfSize(s))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleeve Options */}
      {hasSleeveOptions && (
        <div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: INK_SOFT }}>
            Sleeve Type
          </p>
          <div className="flex gap-2 flex-wrap">
            {sleeveOptions.map((opt) => {
              const active = activeSleeve === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSleeveChange(opt)}
                  className="h-9 px-3.5 text-xs uppercase tracking-wider font-medium transition-colors"
                  style={{
                    borderRadius: '4px',
                    border: `1px solid ${active ? NAVY : LINE}`,
                    background: active ? NAVY : PAPER,
                    color: active ? '#FFFFFF' : INK,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zip Options */}
      {hasZipOptions && (
        <div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: INK_SOFT }}>
            Zip Option
          </p>
          <div className="flex gap-2 flex-wrap">
            {zipOptions.map((opt) => {
              const active = activeZip === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onZipChange(opt)}
                  className="h-9 px-3.5 text-xs uppercase tracking-wider font-medium transition-colors"
                  style={{
                    borderRadius: '4px',
                    border: `1px solid ${active ? NAVY : LINE}`,
                    background: active ? NAVY : PAPER,
                    color: active ? '#FFFFFF' : INK,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add-ons: Pant & Shawl */}
      <AddonSelector
        label="Matching Pant"
        options={pantOptions}
        activeId={activePantId}
        onChange={onPantChange}
        formatINR={formatINR}
      />

      <AddonSelector
        label="Matching Shawl / Dupatta"
        options={shawlOptions}
        activeId={activeShawlId}
        onChange={onShawlChange}
        formatINR={formatINR}
      />

    </div>
  );
}
