'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Heart,
  MessageCircle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WhishlistContext';
import CouponMarquee from './CouponMarquee';

const STORE_NAME = 'JAI WOMENS WORLD';
const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919500381414';

// Brand tokens
const NAVY = '#172333';
const INK = '#171717';
const INK_MUTED = '#77716F';
const ROSE = '#B98270';
const BLUSH = '#D8B5A9';
const GOLD = '#BFA078';
const BORDER = '#E9DFD9';
const BG_IVORY = '#F5F0E9';
const BG_WHITE = '#FFFFFF';
const RUST = '#B0503A';

function SelectField({ value, onChange, disabled, style, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-sm outline-none disabled:opacity-50 transition-colors"
        style={style}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#77716F]"
      />
    </div>
  );
}

// Bulk enquiry modal: collects details and opens WhatsApp with prefilled message
function BulkEnquiryModal({ whatsappNumber, categories, products = [], onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', quantity: '', details: '' });
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [error, setError] = useState('');

  let selectedCategory = null;
  for (const c of categories) {
    if (String(c._id) === categoryId) {
      selectedCategory = { label: c.name, nodes: [c, ...(c.subcategories || [])] };
      break;
    }
    const sub = c.subcategories?.find((s) => String(s._id) === categoryId);
    if (sub) {
      selectedCategory = { label: `${c.name} - ${sub.name}`, nodes: [sub] };
      break;
    }
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => {
        const key = String(p.category?._id ?? p.category ?? '');
        const slug = p.category?.slug ?? p.categorySlug;
        return selectedCategory.nodes.some(
          (n) => String(n._id) === key || n.slug === key || (slug && n.slug === slug)
        );
      })
    : [];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setField(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.replace(/\D/g, '').slice(-10);
    const quantity = form.quantity.trim();

    if (!name) return setError('Please enter your name');
    if (phone.length !== 10) return setError('Enter a valid 10-digit mobile number');
    if (!quantity) return setError('Please enter the quantity needed');
    setError('');

    const lines = [
      `Hi ${STORE_NAME}, I would like to make a bulk enquiry.`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      selectedCategory && `Category: ${selectedCategory.label}`,
      `Quantity: ${quantity}`,
      form.details.trim() && `Details: ${form.details.trim()}`,
    ].filter(Boolean);

    const number = String(whatsappNumber).replace(/\D/g, '');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  }

  const inputStyle = {
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    color: INK,
    background: BG_WHITE,
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#172333]/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bulk enquiry"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md p-6 sm:p-7 max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-lg shadow-boutique border border-[#E9DFD9]"
        style={{ background: BG_IVORY }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#B98270]">
              Wholesale &amp; Custom Orders
            </span>
            <h2 className="font-display text-2xl font-semibold text-[#172333]">
              Bulk Enquiry
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#77716F] hover:text-[#172333]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#77716F] mb-5 leading-relaxed font-light">
          Share your requirements and our team will get in touch on WhatsApp with special pricing.
        </p>

        <div className="space-y-3.5">
          <input
            value={form.name}
            onChange={setField('name')}
            placeholder="Your Name *"
            autoComplete="name"
            className="w-full px-3.5 py-2.5 text-sm outline-none focus:border-[#B98270]"
            style={inputStyle}
          />
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={setField('phone')}
            placeholder="10-digit Phone Number *"
            maxLength={10}
            autoComplete="tel"
            className="w-full px-3.5 py-2.5 text-sm outline-none focus:border-[#B98270]"
            style={inputStyle}
          />
          <SelectField
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setProductId('');
            }}
            style={{ ...inputStyle, color: categoryId ? INK : INK_MUTED }}
          >
            <option value="">Select Category (Optional)</option>
            {categories.map((c) =>
              c.subcategories?.length > 0 ? (
                <optgroup key={c._id} label={c.name}>
                  <option value={String(c._id)}>All {c.name}</option>
                  {c.subcategories.map((sub) => (
                    <option key={sub._id} value={String(sub._id)}>{sub.name}</option>
                  ))}
                </optgroup>
              ) : (
                <option key={c._id} value={String(c._id)}>{c.name}</option>
              )
            )}
          </SelectField>

          <input
            value={form.quantity}
            onChange={setField('quantity')}
            placeholder="Quantity Required (e.g. 50 pieces) *"
            className="w-full px-3.5 py-2.5 text-sm outline-none focus:border-[#B98270]"
            style={inputStyle}
          />

          <textarea
            rows={3}
            value={form.details}
            onChange={setField('details')}
            placeholder="Additional requirements (sizes, preferred fabrics, delivery deadline)..."
            className="w-full px-3.5 py-2.5 text-sm outline-none resize-none focus:border-[#B98270]"
            style={inputStyle}
          />
        </div>

        {error && <p className="text-xs mt-3 text-[#B0503A] font-medium">{error}</p>}

        <button
          type="submit"
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-sm font-medium text-white rounded bg-[#172333] hover:bg-[#B98270] transition-colors"
        >
          <MessageCircle size={16} /> Send on WhatsApp
        </button>
      </form>
    </div>
  );
}

export default function Navbar({ categories = [], products = [], whatsappNumber = DEFAULT_WHATSAPP_NUMBER }) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const router = useRouter();
  const { count } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist?.length || 0;

  // Lock scroll when mobile menu or modal is open
  useEffect(() => {
    if (menuOpen || enquiryOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen, enquiryOpen]);

  function onSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  function openEnquiry() {
    closeMobileMenu();
    setEnquiryOpen(true);
  }

  return (
    <>
      <CouponMarquee />

      <header className="sticky top-0 z-50 bg-[#F5F0E9]/95 backdrop-blur-md border-b border-[#E9DFD9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md hover:bg-black/5 text-[#172333]"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden border border-[#E9DFD9] bg-white shadow-xs shrink-0 transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src="/Jai-logo.jpeg"
                    alt={STORE_NAME}
                    fill
                    sizes="52px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="hidden min-[400px]:flex flex-col">
                  <span className="font-display text-lg sm:text-xl font-semibold tracking-wider text-[#172333] leading-none">
                    JAI WOMENS WORLD
                  </span>
                  <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#B98270] font-medium mt-1">
                    Boutique &middot; Tiruvannamalai
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs uppercase tracking-[0.18em] font-medium text-[#171717]">
              <Link
                href="/"
                className="hover:text-[#B98270] transition-colors py-2"
              >
                Home
              </Link>

              {/* All Collections - Direct link with no sublinks */}
              <Link
                href="/products"
                className="hover:text-[#B98270] transition-colors py-2"
              >
                All Collections
              </Link>

              {/* Combo Offers */}
              <Link
                href="/combo"
                className="hover:text-[#B98270] transition-colors py-2 flex items-center gap-1.5"
              >
                <span>Combo Offers</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#B98270] text-white font-semibold">Save</span>
              </Link>

              <Link
                href="/about"
                className="hover:text-[#B98270] transition-colors py-2"
              >
                About
              </Link>

              <button
                type="button"
                onClick={openEnquiry}
                className="hover:text-[#B98270] transition-colors py-2"
              >
                Bulk Enquiry
              </button>
            </nav>

            {/* Right: Action Icons (Search, Wishlist, Orders, Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#172333] hover:bg-[#FFFFFF] transition-all border border-transparent hover:border-[#E9DFD9]"
                aria-label="Search Collection"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              {/* Orders Link */}
              <Link
                href="/orders"
                className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#172333] hover:bg-[#FFFFFF] transition-all border border-transparent hover:border-[#E9DFD9]"
                aria-label="My Orders"
                title="Track Orders"
              >
                <Package size={18} strokeWidth={1.5} />
              </Link>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#172333] hover:bg-[#FFFFFF] transition-all border border-transparent hover:border-[#E9DFD9]"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute 1.5 top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-semibold bg-[#B98270] text-white flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                href="/cart"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#172333] hover:bg-[#FFFFFF] transition-all border border-transparent hover:border-[#E9DFD9]"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute 1.5 top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-semibold bg-[#172333] text-[#F5F0E9] flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            </div>

          </div>

          {/* Inline Search Bar Reveal */}
          {searchOpen && (
            <form
              onSubmit={onSearch}
              className="py-3 border-t border-[#E9DFD9] flex items-center gap-3 animate-slide-up"
            >
              <Search size={16} className="text-[#B98270]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search elegant kurtis, salwar sets, nighties, umbrella designs..."
                className="bg-transparent outline-none w-full text-sm placeholder:text-[#77716F] text-[#171717]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs uppercase tracking-wider text-[#77716F] hover:text-[#171717] px-2 py-1"
              >
                Cancel
              </button>
            </form>
          )}

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-[#F5F0E9] animate-fade-in">
          {/* Drawer Top */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9DFD9] bg-[#FFFFFF]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E9DFD9] bg-white">
                <Image src="/Jai-logo.jpeg" alt={STORE_NAME} fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <span className="font-display font-semibold text-base text-[#172333] block">
                  JAI WOMENS WORLD
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#B98270]">
                  Boutique Collection
                </span>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-full hover:bg-black/5 text-[#171717]"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm font-medium uppercase tracking-[0.14em]">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="block py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              All Collections
            </Link>

            <Link
              href="/combo"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2.5 border-b border-[#E9DFD9] text-[#B98270]"
            >
              <span>Combo Offers</span>
              <span className="text-[10px] bg-[#B98270] text-white px-2 py-0.5 rounded-full font-medium">Save More</span>
            </Link>

            <Link
              href="/orders"
              onClick={closeMobileMenu}
              className="block py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              Track Orders
            </Link>

            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] bg-[#B98270] text-white px-2 py-0.5 rounded-full">{wishlistCount}</span>
              )}
            </Link>

            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="block py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              About Boutique
            </Link>

            <button
              type="button"
              onClick={openEnquiry}
              className="w-full text-left py-2.5 border-b border-[#E9DFD9] text-[#171717]"
            >
              Bulk / Wholesale Enquiry
            </button>
          </div>

          {/* Drawer Bottom Contact */}
          <div className="p-6 border-t border-[#E9DFD9] bg-[#FFFFFF] space-y-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded flex items-center justify-center gap-2 bg-[#172333] hover:bg-[#B98270] text-white text-xs tracking-wider uppercase font-medium transition-colors"
            >
              <MessageCircle size={15} /> WhatsApp Support
            </a>
            <p className="text-center text-[11px] text-[#77716F]">
              Need help? Call +91 9500381414
            </p>
          </div>
        </div>
      )}

      {/* Bulk Enquiry Modal */}
      {enquiryOpen && (
        <BulkEnquiryModal
          whatsappNumber={whatsappNumber}
          categories={categories}
          products={products}
          onClose={() => setEnquiryOpen(false)}
        />
      )}
    </>
  );
}
