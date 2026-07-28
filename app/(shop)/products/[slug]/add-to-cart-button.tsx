'use client';

import { useState } from 'react';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/components/cart/cart-store';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (!product.isInStock) return;
    addItem({ productId: product.id, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.isInStock}
      className="mt-6 w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink
                 transition-colors hover:bg-brass-hover disabled:cursor-not-allowed disabled:bg-bg-surface2
                 disabled:text-ink-faint"
    >
      {!product.isInStock ? 'Stokta yok' : justAdded ? 'Sepete eklendi ✓' : 'Sepete ekle'}
    </button>
  );
}
