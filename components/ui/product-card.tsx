'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/components/cart/cart-store';

const DELIVERY_TYPE_LABELS: Record<Product['deliveryType'], string> = {
  pin: 'PIN kodu',
  code: 'Dijital kod',
  license_key: 'Lisans anahtarı',
  file: 'Dosya',
  account_credentials: 'Hesap bilgisi',
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount = product.discountedPrice && product.discountedPrice !== product.basePrice;

  function handleAdd() {
    if (!product.isInStock) return;
    addItem({ productId: product.id, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-card border border-border
                 bg-bg-surface transition-colors hover:border-border-strong"
    >
      {/* Üst şerit: kategori/platform + tarama çizgisi (imza öğesi, hover'da belirir) */}
      <div className="relative overflow-hidden px-4 pt-4 pb-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b
                     from-brass/10 to-transparent opacity-0 transition-opacity duration-300
                     group-hover:opacity-100"
        >
          <div className="absolute inset-x-0 h-8 bg-brass/20 blur-sm animate-scan-sweep" />
        </div>

        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            {product.platformName ?? product.categoryName}
          </span>
          <span className="font-mono text-[11px] text-ink-faint">{product.sku}</span>
        </div>

        <h3 className="relative mt-2 font-display text-[17px] font-medium leading-snug text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-brass">
            {product.name}
          </Link>
        </h3>

        {product.shortDescription && (
          <p className="relative mt-1 line-clamp-2 text-[13px] text-ink-muted">
            {product.shortDescription}
          </p>
        )}
      </div>

      {/* Delikli bilet ayracı — imza öğesi */}
      <div className="ticket-perforation mx-4" />

      {/* Alt bölüm: fiyat, stok, teslim tipi, sepete ekle */}
      <div className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-bg-surface2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
            {DELIVERY_TYPE_LABELS[product.deliveryType]}
          </span>

          {product.isInStock ? (
            <span className="flex items-center gap-1.5 text-[11px] text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-dot" aria-hidden="true" />
              Anında teslim
            </span>
          ) : (
            <span className="text-[11px] text-coral">Stokta yok</span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="font-mono text-[12px] text-ink-faint line-through">
                {formatPrice(product.basePrice, product.currency)}
              </span>
            )}
            <span className="font-display text-xl font-medium text-ink">
              {formatPrice(product.currentPrice, product.currency)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isInStock}
            className="rounded-full border border-brass/40 bg-brass/10 px-4 py-2 text-[13px]
                       font-medium text-brass transition-colors hover:bg-brass hover:text-brass-ink
                       disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent
                       disabled:text-ink-faint"
          >
            {justAdded ? 'Sepete eklendi' : 'Sepete ekle'}
          </button>
        </div>

        {product.warrantyDays > 0 && (
          <p className="font-mono text-[11px] text-ink-faint">
            {product.warrantyDays} gün değişim garantisi
          </p>
        )}
      </div>
    </article>
  );
}

function formatPrice(amount: string, currency: string): string {
  const value = Number(amount);

  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value);
}
