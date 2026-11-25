'use client';

import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';
import { piecesPerUnit } from '@/lib/comboPieces';

export default function AddComboButton({ combo }) {
  const { addItem } = useCart();
  const router = useRouter();

  const item = {
    productId: combo._id,
    variantId: 'combo',
    comboId: combo._id,
    isCombo: true,
    name: combo.name,
    image: combo.images?.[0],
    color: '-',
    size: 'Combo',
    price: combo.comboPrice,
    qty: 1,
    // Pieces in ONE combo (admin-set piecesPerCombo, else products count)
    pieces: piecesPerUnit(combo),
  };

  function handleAddToCart() {
    addItem(item);
  }

  function handleBuyNow() {
    addItem(item);
    router.push('/checkout');
  }

  return (
    <div className="flex gap-2.5 sm:gap-3">
      <button
        onClick={handleAddToCart}
        className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider py-3 px-3 rounded-full border border-[#12233F] text-[#12233F] bg-white hover:bg-[#FCE4E8] active:scale-[0.98] transition-all"
      >
        <ShoppingBag size={16} strokeWidth={1.75} />
        Add to cart
      </button>
      <button
        onClick={handleBuyNow}
        className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider py-3 px-3 rounded-full text-white bg-[#12233F] hover:bg-[#B02F5E] shadow-sm active:scale-[0.98] transition-all"
      >
        <Zap size={16} fill="currentColor" strokeWidth={0} />
        Buy now
      </button>
    </div>
  );
}