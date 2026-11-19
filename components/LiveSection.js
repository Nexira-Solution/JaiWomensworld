'use client';

import { useState } from 'react';
import { getYouTubeId } from '@/lib/youtube';
import { Radio } from 'lucide-react';

const TABS = [
  { key: 'yesterday', label: 'Yesterday', hint: 'Watch the replay' },
  { key: 'today', label: 'Today', hint: 'Streaming live' },
  { key: 'tomorrow', label: 'Tomorrow', hint: 'Upcoming showcase' },
];

export default function LiveSection({ streams }) {
  const slots = TABS.map((t) => ({
    ...t,
    title: streams?.[t.key]?.title || '',
    id: getYouTubeId(streams?.[t.key]?.url),
  }));

  const hasAny = slots.some((s) => s.id);
  const initial = slots.find((s) => s.key === 'today' && s.id)?.key || slots.find((s) => s.id)?.key || 'today';
  const [active, setActive] = useState(initial);

  if (!hasAny) return null;

  const current = slots.find((s) => s.key === active);

  return (
    <section className="py-16 bg-[#FFFFFF] border-y border-[#E9DFD9]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B98270]/10 text-[#B98270] text-[10.5px] uppercase tracking-widest font-semibold mb-2">
            <Radio size={12} className="animate-pulse text-[#B98270]" />
            Live Boutique Showcases
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#172333]">
            Watch Jai Live
          </h2>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {slots.map((s) => {
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                type="button"
                disabled={!s.id}
                onClick={() => setActive(s.key)}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all disabled:opacity-40 ${
                  isActive
                    ? 'bg-[#172333] text-white shadow-sm'
                    : 'bg-[#F5F0E9] text-[#172333] hover:bg-[#F4E8E3] border border-[#E9DFD9]'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {current?.id ? (
          <div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#E9DFD9] shadow-card bg-black">
              <iframe
                key={current.id}
                src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0`}
                title={current.title || `${current.label} live`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p className="mt-4 text-center text-xs sm:text-sm text-[#171717]">
              <span className="font-semibold text-[#B98270] uppercase tracking-wider">{current.hint}</span>
              {current.title && <span className="text-[#77716F]"> &middot; {current.title}</span>}
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-[#77716F]">
            No live stream scheduled for this slot.
          </p>
        )}
      </div>
    </section>
  );
}
