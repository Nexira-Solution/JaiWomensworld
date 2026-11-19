export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Tag, Sparkles, ArrowRight, PackageOpen } from 'lucide-react';

async function getCombos() {
  try {
    await dbConnect();
    const combos = await Combo.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(combos));
  } catch (err) {
    console.error('Error fetching combos:', err?.message || err);
    return [];
  }
}

export const metadata = {
  title: 'Combo Offers & Multi-Packs | Jai Womens World',
  description:
    'Discover curated combo sets and multi-pack offers on kurtis and women clothing from Jai Womens World, Tiruvannamalai.',
};

export default async function CombosPage() {
  const combos = await getCombos();

  return (
    <div className="bg-[#F5F0E9] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[#B98270] mb-2">
            <Sparkles size={12} className="text-[#BFA078]" />
            Beautifully Paired
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#172333] tracking-tight">
            Boutique Combo Sets
          </h1>
          <div className="w-10 h-0.5 bg-[#BFA078] mx-auto my-3" />
          <p className="text-xs sm:text-sm text-[#77716F] font-light leading-relaxed">
            Buy together and save more. Explore our curated multi-piece collections and color packs tailored for maximum versatility.
          </p>
        </div>

        {/* Empty State */}
        {combos.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#E9DFD9] p-8 max-w-lg mx-auto shadow-card">
            <PackageOpen size={36} className="mx-auto text-[#B98270]/60 mb-3" />
            <h3 className="font-display text-xl font-semibold text-[#172333]">No Active Combo Sets</h3>
            <p className="text-xs text-[#77716F] mt-1 font-light">
              We are assembling new seasonal combo offers. Please check back shortly.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#172333] hover:bg-[#B98270] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-boutique"
            >
              <span>Explore All Kurtis</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Combos Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {combos.map((c) => {
              const isColorPack = c.type === 'color-pack';
              const cheapestPack = isColorPack && c.packOptions?.length
                ? c.packOptions.reduce((min, p) => (p.price < min.price ? p : min), c.packOptions[0])
                : null;

              const cover = c.images?.[0] || c.image;
              const displayPrice = isColorPack ? cheapestPack?.price ?? 0 : c.comboPrice;
              const displayOriginal = isColorPack ? cheapestPack?.originalPrice ?? 0 : c.originalPrice;
              const savings = displayOriginal > displayPrice ? displayOriginal - displayPrice : 0;
              const pct = displayOriginal > 0 ? Math.round((savings / displayOriginal) * 100) : 0;

              return (
                <Link
                  key={c._id}
                  href={`/combo/${c.slug}`}
                  className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-[#E9DFD9] hover:border-[#D8B5A9] hover:shadow-card transition-all"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F4E8E3]/60">
                    {cover ? (
                      <img
                        src={cover}
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E9DFD9]" />
                    )}

                    {pct > 0 && (
                      <div className="absolute top-3 left-3 bg-[#BFA078] text-[#172333] text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Tag size={10} /> {pct}% OFF
                      </div>
                    )}

                    {isColorPack && (
                      <div className="absolute top-3 right-3 bg-[#172333] text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        Color Pack
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#B98270] font-medium block mb-1">
                        Combo Pack
                      </span>
                      <h3 className="font-body text-xs sm:text-sm font-medium text-[#171717] line-clamp-1 group-hover:text-[#B98270] transition-colors">
                        {c.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E9DFD9]/60 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm sm:text-base text-[#172333]">
                          {isColorPack && 'From '}{formatINR(displayPrice)}
                        </span>
                        {savings > 0 && (
                          <span className="text-xs text-[#77716F] line-through font-light">
                            {formatINR(displayOriginal)}
                          </span>
                        )}
                      </div>

                      {savings > 0 && (
                        <span className="text-[10px] text-[#B98270] font-medium">
                          Save {formatINR(savings)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
