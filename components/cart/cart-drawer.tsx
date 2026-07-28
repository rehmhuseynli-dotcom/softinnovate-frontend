'use client';

import Link from 'next/link';
import { useCartStore } from './cart-store';

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-sm flex-col border-l border-border bg-bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Sepet"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Sepetiniz</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sepeti kapat"
            className="rounded-full p-1.5 text-ink-muted hover:bg-bg-surface2 hover:text-ink"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-center text-[14px] text-ink-muted">Sepetiniz boş.</p>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between rounded-card border border-border px-3 py-2.5"
                >
                  <div>
                    <p className="text-[13px] text-ink">Ürün #{item.productId}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label="Adet azalt"
                        className="h-6 w-6 rounded-full border border-border text-ink-muted hover:border-border-strong"
                      >
                        −
                      </button>
                      <span className="font-mono text-[13px] text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label="Adet artır"
                        className="h-6 w-6 rounded-full border border-border text-ink-muted hover:border-border-strong"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-[12px] text-coral hover:underline"
                  >
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>

            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-4 block rounded-full bg-brass px-4 py-3 text-center text-[14px]
                         font-medium text-brass-ink hover:bg-brass-hover"
            >
              Ödemeye geç
            </Link>
          </>
        )}
      </aside>
    </div>
  );
}
