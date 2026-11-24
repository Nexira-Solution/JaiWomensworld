'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ListTree, ShoppingCart, Boxes, Image as ImageIcon, Sparkles,
  Clapperboard, Star, Ticket, Layers, FileBarChart, Settings as SettingsIcon, Menu, X, LogOut
} from 'lucide-react';

// Admin theme tokens matching Jai Womens World Brand Palette:
// Main background: #FFF4F3
// Sidebar background: #12233F
// Primary buttons: #12233F
// Accent: #B02F5E
// Card background: #FFFFFF
// Main text: #171717
// Secondary text: #7B5D69
// Borders: #F5D5DB

const INK = '#171717';
const INK_SOFT = '#7B5D69';
const SIDEBAR_BG = '#12233F';
const SIDEBAR_HOVER = '#1D3358';
const ACCENT = '#B02F5E';
const BLUSH = '#F4A7BA';
const LINE = '#F5D5DB';
const PAPER = '#FFF4F3';

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',      icon: Package },
  { href: '/admin/categories', label: 'Categories',    icon: ListTree },
  { href: '/admin/orders',     label: 'Orders',        icon: ShoppingCart },
  { href: '/admin/inventory',  label: 'Inventory',     icon: Boxes },
  { href: '/admin/combos',     label: 'Combo Offers',  icon: Layers },
  { href: '/admin/banners',    label: 'Banners',       icon: ImageIcon },
  { href: '/admin/reels',      label: 'Shop by Reels', icon: Clapperboard },
  { href: '/admin/reviews',    label: 'Reviews',       icon: Star },
  { href: '/admin/coupons',    label: 'Coupons',       icon: Ticket },
  { href: '/admin/reports',    label: 'Sales Reports', icon: FileBarChart },
  { href: '/admin/cofounder',  label: 'AI Cofounder',  icon: Sparkles },
  { href: '/admin/settings',   label: 'Settings',      icon: SettingsIcon },
];

export default function AdminShell({ admin, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: PAPER, color: INK }}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(18, 35, 63, 0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, slide-out drawer on mobile */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 h-screen transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: SIDEBAR_BG,
          borderRight: `1px solid rgba(233, 223, 217, 0.12)`,
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4.5 border-b shrink-0"
          style={{ borderColor: 'rgba(233, 223, 217, 0.12)' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white/10 p-0.5 border border-[#D9A441]/40 shrink-0">
              <Image src="/Jai-logo.jpeg" alt="Jai Womens World" fill className="object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-base text-white">
                Jai Womens World
              </span>
              <span
                className="text-[9.5px] tracking-[0.2em] uppercase mt-0.5"
                style={{ color: BLUSH }}
              >
                Administration
              </span>
            </div>
          </div>
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded transition-colors"
                style={{
                  background: active ? ACCENT : 'transparent',
                  color: active ? '#FFFFFF' : '#F5D5DB',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = SIDEBAR_HOVER;
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#F5D5DB';
                  }
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                <span className="tracking-wide">{label}</span>
              </Link>
            );
          })}

          <div className="my-3 border-t" style={{ borderColor: 'rgba(233, 223, 217, 0.12)' }} />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium w-full rounded transition-colors text-[#F4A7BA] hover:bg-[#1D3358] hover:text-white"
          >
            <LogOut size={16} />
            <span className="tracking-wide">Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main content area - offset by lg:pl-64 to accommodate fixed sidebar */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-64">
        {/* Mobile topbar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b shadow-xs"
          style={{
            background: '#FFFFFF',
            borderColor: LINE,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="text-[#12233F] p-1 rounded hover:bg-black/5"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-display font-semibold text-base text-[#12233F]">
              Jai Womens World Admin
            </span>
          </div>

          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#F5D5DB]">
            <Image src="/Jai-logo.jpeg" alt="Jai Womens World" fill className="object-cover" />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full flex-1" style={{ color: INK }}>
          {children}
        </main>
      </div>
    </div>
  );
}
