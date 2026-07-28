'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/lib/api';

interface CartState {
  items: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (line) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === line.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === line.productId ? { ...i, quantity: i.quantity + line.quantity } : i,
              ),
            };
          }

          return { items: [...state.items, line] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }, // localStorage — misafir sepeti de korunur
  ),
);
