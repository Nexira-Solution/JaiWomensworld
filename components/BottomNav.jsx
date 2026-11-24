'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WhishlistContext';

// Floating glass bar: raspberry marks the current page, gold marks the badges.
const RASPBERRY = '#B02F5E';
const NAVY = '#12233F';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { wishlist } = useWishlist();

  // Admin pages have their own shell/navigation — never show the storefront
  // bottom nav (or its spacer) there.
  if (pathname?.startsWith('/admin')) return null;

  const wishlistCount = wishlist?.length || 0;

  const items = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.label === 'Wishlist' ? wishlistCount : item.label === 'Cart' ? cartCount : undefined,
  }));

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed mobile nav */}
      <div className="md:hidden h-20" />

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-[max(10px,env(safe-area-inset-bottom))]"
        aria-label="Quick navigation"
      >
        <div className="mx-auto max-w-md flex items-center justify-between rounded-full bg-white/90 backdrop-blur-xl border border-white shadow-[0_14px_34px_-10px_rgba(107,24,56,.5)] px-2 py-1.5">
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 transition-all duration-300 ${
                  active ? 'bg-gradient-to-r from-[#B02F5E] to-[#D14A7A] text-white shadow-md flex-[1.6]' : 'text-[#12233F]/70 active:scale-90'
                }`}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={active ? 2 : 1.6} fill={active && label === 'Wishlist' ? '#fff' : 'none'} />
                  {badge > 0 && (
                    <span
                      className="absolute -top-2 -right-2.5 text-[9px] font-bold leading-none rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 bg-[#F6D573] text-[#4A0F28] border border-white"
                    >
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                {active && <span className="text-[13px] font-semibold">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
