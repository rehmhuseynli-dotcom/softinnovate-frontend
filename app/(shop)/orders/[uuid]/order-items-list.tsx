'use client';

import { useState } from 'react';
import type { OrderItemDetail } from '@/lib/api';
import { api, ApiError } from '@/lib/api';

export function OrderItemsList({ orderUuid, items }: { orderUuid: string; items: OrderItemDetail[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-card border border-border bg-bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[15px] text-ink">{item.productName}</span>
            <span className="font-mono text-[13px] text-ink-muted">
              {item.quantity} adet · {item.lineTotal}
            </span>
          </div>

          {item.delivery ? (
            <DeliveryReveal orderUuid={orderUuid} delivery={item.delivery} />
          ) : (
            <p className="mt-2 font-mono text-[12px] text-ink-faint">Teslimat bekleniyor…</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function DeliveryReveal({
  orderUuid,
  delivery,
}: {
  orderUuid: string;
  delivery: NonNullable<OrderItemDetail['delivery']>;
}) {
  const [revealedContent, setRevealedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReveal() {
    setIsLoading(true);
    setError(null);

    try {
      const { content } = await api.orders.revealDelivery(orderUuid, delivery.id);
      setRevealedContent(content);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İçerik gösterilemedi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="ticket-perforation mt-3 pt-3">
      <div className="flex items-center justify-between gap-3">
        <code className="flex-1 truncate rounded-full bg-bg-surface2 px-3 py-2 font-mono text-[13px] text-ink">
          {revealedContent ?? delivery.maskedContent}
        </code>

        {!revealedContent && (
          <button
            type="button"
            onClick={handleReveal}
            disabled={isLoading}
            className="shrink-0 rounded-full border border-brass/40 px-3 py-2 text-[12px]
                       font-medium text-brass hover:bg-brass hover:text-brass-ink disabled:opacity-50"
          >
            {isLoading ? 'Gösteriliyor…' : 'Göster'}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-[12px] text-coral">{error}</p>}

      {delivery.warrantyExpiresAt && (
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          {delivery.warrantyValid
            ? `Değişim garantisi: ${new Date(delivery.warrantyExpiresAt).toLocaleDateString('tr-TR')} tarihine kadar geçerli`
            : 'Değişim garantisi süresi doldu'}
        </p>
      )}
    </div>
  );
}
