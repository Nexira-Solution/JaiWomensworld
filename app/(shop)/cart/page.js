'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, cartKey } from '@/components/CartContext';
import { useCartQuote } from '@/lib/useCartQuote';
import { formatINR } from '@/lib/utils';
import CartRecommendations from '@/components/CartRecommendations';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { loading: syncing } = useCartQuote();

  if (items.length === 0) {
    return (
      <div className="bg-[#FFF4F3] min-h-[70vh] py-16 px-4">
        <div className="flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#F5D5DB] p-8 sm:p-10 text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-[#FCE4E8] flex items-center justify-center mx-auto mb-5 text-[#B02F5E]">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#12233F] mb-2">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-xs sm:text-sm text-[#7B5D69] font-light mb-8 leading-relaxed">
            Discover our curated collection of handcrafted kurtis, salwar sets, and comfortable boutique fashion.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-medium transition-colors shadow-boutique"
          >
            <span>Explore Collections</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        </div>
        <CartRecommendations />
      </div>
    );
  }

  return (
    <div className="bg-[#FFF4F3] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 border-b border-[#F5D5DB] pb-4 flex items-end justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#B02F5E] block mb-1">
              Shopping Summary
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#12233F]">
              Your Shopping Bag
            </h1>
          </div>
          <span className="text-xs text-[#7B5D69]">
            {items.reduce((sum, it) => sum + it.qty, 0)} Items
          </span>
        </div>

        {/* Cart Items List */}
        <div className="bg-white rounded-xl border border-[#F5D5DB] shadow-card overflow-hidden divide-y divide-[#F5D5DB]">
          {items.map((item) => {
            const key = cartKey(item);
            const details = [
              item.color && `Color: ${item.color}`,
              !item.packDetails && item.size && `Size: ${item.size}`,
              item.sleeveType,
              item.zipType,
              item.pantOption?.name && `Pant: ${item.pantOption.name}`,
              item.shawlOption?.name && `Shawl: ${item.shawlOption.name}`,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div key={key} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-start">
                {/* Image */}
                <div className="relative shrink-0 w-20 h-26 sm:w-24 sm:h-32 rounded-md overflow-hidden bg-[#FCE4E8] border border-[#F5D5DB]">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold text-[#12233F] truncate">
                    {item.name}
                  </h3>
                  {details && (
                    <p className="text-xs text-[#7B5D69] mt-1 font-light leading-relaxed">
                      {details}
                    </p>
                  )}
                  {item.isCombo && item.pieces > 1 && (
                    <span className="inline-block text-[10px] text-[#B02F5E] font-medium bg-[#B02F5E]/10 px-2 py-0.5 rounded mt-1.5">
                      {item.pieces} pieces set
                    </span>
                  )}
                  <p className="text-sm font-semibold text-[#12233F] mt-2">
                    {formatINR(item.price)}
                  </p>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-[#F5D5DB] rounded bg-[#FFF4F3]">
                      <button
                        onClick={() => updateQty(key, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-[#12233F] hover:bg-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-[#12233F]">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(key, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-[#12233F] hover:bg-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(key)}
                      className="text-xs text-[#7B5D69] hover:text-[#C2384F] flex items-center gap-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right shrink-0">
                  <span className="font-semibold text-sm sm:text-base text-[#12233F]">
                    {formatINR(item.price * item.qty)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="mt-8 bg-white rounded-xl border border-[#F5D5DB] shadow-card p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#F5D5DB]">
            <span className="text-xs uppercase tracking-wider text-[#7B5D69] font-medium">
              Subtotal {syncing && <span className="text-[11px] lowercase italic">(syncing prices...)</span>}
            </span>
            <span className="font-display text-2xl font-semibold text-[#12233F]">
              {formatINR(subtotal)}
            </span>
          </div>

          <p className="text-[11px] text-[#7B5D69] mt-2 font-light">
            Taxes included. Delivery fee calculated at checkout based on location.
          </p>

          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded bg-[#12233F] hover:bg-[#B02F5E] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all shadow-boutique"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight size={14} />
          </Link>

          <div className="mt-6 pt-4 border-t border-[#F5D5DB] flex items-center justify-center gap-6 text-[11px] text-[#7B5D69]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#D9A441]" />
              Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <Truck size={14} className="text-[#B02F5E]" />
              Tracked Delivery
            </span>
          </div>
        </div>

      </div>
      <CartRecommendations />
    </div>
  );
}
