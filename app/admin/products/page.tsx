'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError, type AdminProduct } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  active: 'Aktif',
  out_of_stock: 'Stokta yok',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-bg-surface2 text-ink-muted',
  active: 'bg-mint/20 text-mint',
  out_of_stock: 'bg-coral/20 text-coral',
  archived: 'bg-bg-surface2 text-ink-faint',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const timeout = setTimeout(() => {
      api.adminProducts
        .list({ status: statusFilter || undefined, search: search || undefined })
        .then(({ data }) => {
          if (!cancelled) setProducts(data);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof ApiError ? err.message : 'Ürünler yüklenemedi.');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 300); // arama için basit debounce

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [statusFilter, search]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
          <h1 className="font-display text-2xl font-medium text-ink">Ürünler</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brass px-4 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover"
        >
          Yeni ürün
        </Link>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['', 'draft', 'active', 'out_of_stock', 'archived'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
              statusFilter === status
                ? 'border-brass bg-brass/10 text-ink'
                : 'border-border text-ink-muted hover:border-border-strong'
            }`}
          >
            {status ? STATUS_LABELS[status] : 'Tümü'}
          </button>
        ))}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SKU veya isimle ara…"
          className="ml-auto w-56 rounded-full border border-border bg-bg-surface2 px-3.5 py-1.5
                     text-[12px] text-ink placeholder:text-ink-faint focus:border-brass"
        />
      </div>

      {error && <p className="text-[13px] text-coral">{error}</p>}
      {isLoading && <p className="text-[13px] text-ink-muted">Yükleniyor…</p>}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-bg-surface2 text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Ürün</th>
              <th className="px-4 py-2.5 font-medium">Fiyat</th>
              <th className="px-4 py-2.5 font-medium">Stok</th>
              <th className="px-4 py-2.5 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border hover:bg-bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="block">
                    <p className="text-ink">{product.translations.tr.name ?? product.sku}</p>
                    <p className="font-mono text-[11px] text-ink-faint">{product.sku}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">
                  {product.basePrice} {product.baseCurrency}
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">{product.availableStockCount}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLORS[product.status]}`}>
                    {STATUS_LABELS[product.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
