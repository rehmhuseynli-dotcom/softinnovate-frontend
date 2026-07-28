'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { useCartStore } from '@/components/cart/cart-store';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function SiteHeader() {
  const { user, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/products" className="font-display text-[16px] font-medium text-ink">
            Dijital Hesap Satış Platformu
          </Link>

          <nav className="flex items-center gap-5 text-[13px] text-ink-muted">
            <Link href="/products" className="hover:text-ink">Ürünler</Link>
            {user && (
              <>
                <Link href="/support" className="hover:text-ink">Destek</Link>
                <Link href="/account/affiliate" className="hover:text-ink">Referans</Link>
              </>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full border border-border px-3 py-1.5 hover:border-border-strong hover:text-ink"
            >
              Sepet
              {cartCount > 0 && (
                <span className="ml-1.5 rounded-full bg-brass px-1.5 py-0.5 text-[10px] font-medium text-brass-ink">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/account/privacy" className="hover:text-ink" title="Gizlilik ayarları">
                  {user.name}
                </Link>
                <button onClick={() => logout()} className="hover:text-coral">
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-brass px-3.5 py-1.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover"
              >
                Giriş yap
              </Link>
            )}
          </nav>
        </div>
      </header>

      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
