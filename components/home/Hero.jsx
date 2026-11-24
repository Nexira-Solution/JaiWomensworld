import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Gift, Percent, BadgeCheck, Headphones } from 'lucide-react';
import { BlossomBranch, SilkWaves, FallingPetals, LotusDivider } from '@/components/Decor';

const PILLS = [
  { Icon: Gift, a: 'New', b: 'Arrivals', href: '/products' },
  { Icon: Percent, a: 'Exclusive', b: 'Offers', href: '/combo' },
  { Icon: BadgeCheck, a: 'Premium', b: 'Quality', href: '/products' },
  { Icon: Headphones, a: 'Fast', b: 'Support', href: 'https://wa.me/919500381414' },
];

const CATEGORIES = ['Sarees', 'Churidars', 'Kurtis', 'Nighties', 'Inners'];

/**
 * Landing hero: text on the left, the model inside a gold-lit arch, four
 * floating shortcut pills on the right. Shown when no admin banners exist.
 */
export default function Hero({ watchHref = '/combo' }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFE6EA] via-[#FFF1F1] to-[#FFF8F7]">
      <BlossomBranch className="w-[170px] sm:w-[250px] lg:w-[300px] opacity-90" />
      <FallingPetals count={7} />
      {/* translucent silk veil behind the model */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#FFD3DE]/70 to-transparent blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-14 sm:pt-16 lg:pt-14 pb-36 sm:pb-44 lg:pb-52">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-6">
          {/* Copy */}
          <div className="lg:col-span-6 text-center lg:text-left order-2 lg:order-1">
            <LotusDivider className="lg:justify-start mb-4 hero-in" />
            <h1 className="font-display font-bold text-[#12233F] leading-[1.08] text-[40px] sm:text-6xl lg:text-[64px]">
              <span className="block hero-in" style={{ animationDelay: '.05s' }}>The Complete</span>
              <span className="block text-[#B02F5E] hero-in" style={{ animationDelay: '.18s' }}>Women&rsquo;s Fashion</span>
              <span className="block hero-in" style={{ animationDelay: '.3s' }}>Destination</span>
            </h1>

            <ul
              className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-y-1 font-display font-semibold text-[#12233F] text-[15px] sm:text-lg hero-in"
              style={{ animationDelay: '.42s' }}
            >
              {CATEGORIES.map((c, i) => (
                <li key={c} className="flex items-center">
                  <Link href={`/category/${c.toLowerCase()}`} className="px-3 hover:text-[#B02F5E] transition-colors">
                    {c}
                  </Link>
                  {i < CATEGORIES.length - 1 && <span className="h-4 w-px bg-[#12233F]/40" aria-hidden="true" />}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-base sm:text-lg text-[#12233F]/85 leading-relaxed hero-in" style={{ animationDelay: '.52s' }}>
              Elegance for Every Occasion,
              <br className="hidden sm:block" /> Comfort for Everyday Life.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 hero-in" style={{ animationDelay: '.62s' }}>
              <Link
                href="/products"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#12233F] px-8 py-4 text-white font-semibold shadow-[0_16px_30px_-14px_rgba(18,35,63,.8)] hover:bg-[#6B1838] transition-colors"
              >
                Shop Collections
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href={watchHref} className="group inline-flex items-center gap-3 text-[#12233F] font-medium">
                <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#B02F5E] bg-white text-[#B02F5E] transition-all group-hover:bg-[#B02F5E] group-hover:text-white animate-pulse-ring">
                  <Play size={18} className="ml-0.5 fill-current" />
                </span>
                Watch Collection
              </Link>
            </div>
          </div>

          {/* Model in arch */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative flex justify-center">
            <div className="relative w-[78%] max-w-[400px] sm:max-w-[430px] hero-arch">
              <div className="absolute -inset-3 rounded-t-[999px] rounded-b-[36px] bg-gradient-to-b from-[#F6D573]/80 via-[#FFE9A6]/40 to-transparent blur-[2px]" aria-hidden="true" />
              <div className="relative aspect-[4/5.1] overflow-hidden rounded-t-[999px] rounded-b-[32px] gold-frame bg-[#FCE4E8] shadow-[0_30px_60px_-24px_rgba(107,24,56,.55)]" style={{ borderWidth: 3 }}>
                <Image
                  src="/images/hero/hero-model.jpg"
                  alt="Woman wearing a navy silk saree with a pink and gold zari border"
                  fill
                  priority
                  sizes="(max-width:1024px) 80vw, 430px"
                  className="object-cover object-top"
                />
                <span className="shine-sweep absolute inset-0 overflow-hidden" aria-hidden="true" />
              </div>
            </div>

            {/* Floating shortcut pills (right on desktop, strip under the arch on mobile) */}
            <ul className="absolute -right-2 xl:-right-6 top-6 hidden lg:flex flex-col gap-4" aria-label="Shortcuts">
              {PILLS.map(({ Icon, a, b, href }, i) => (
                <li key={a} className="animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <Link
                    href={href}
                    className="flex w-[148px] items-center gap-3 rounded-full bg-white/80 backdrop-blur-md border border-white px-4 py-3 shadow-[0_10px_24px_-14px_rgba(107,24,56,.5)] hover:bg-white hover:-translate-x-1 transition-all"
                  >
                    <Icon size={26} strokeWidth={1.4} className="text-[#B02F5E] shrink-0" />
                    <span className="text-[13px] font-medium leading-tight text-[#12233F]">
                      {a}
                      <br />
                      {b}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="lg:hidden mt-10 order-3 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10" aria-label="Shortcuts">
          {PILLS.map(({ Icon, a, b, href }) => (
            <li key={a}>
              <Link href={href} className="flex items-center gap-2.5 rounded-full bg-white/85 border border-white px-4 py-2.5 shadow-sm active:scale-95 transition-transform">
                <Icon size={22} strokeWidth={1.4} className="text-[#B02F5E] shrink-0" />
                <span className="text-[12.5px] font-medium leading-tight text-[#12233F]">{a} {b}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SilkWaves />
    </section>
  );
}
