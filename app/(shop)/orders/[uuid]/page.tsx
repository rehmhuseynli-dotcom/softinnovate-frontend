'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, type OrderDetail } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';
import { OrderItemsList } from './order-items-list';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Ödeme bekleniyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  delivered: 'Teslim edildi',
  partially_refunded: 'Kısmen iade edildi',
  refunded: 'İade edildi',
  cancelled: 'İptal edildi',
  failed: 'Başarısız',
  flagged_for_review: 'İnceleniyor',
};

export default function OrderTrackingPage() {
  const { isReady } = useRequireAuth();
  const params = useParams<{ uuid: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!isReady) return;

    api.orders.get(params.uuid).then(({ data }) => setOrder(data));
  }, [isReady, params.uuid]);

  if (!isReady || !order) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">
          Sipariş {order.orderNumber}
        </span>
        <h1 className="mt-1 font-display text-2xl font-medium text-ink">
          {STATUS_LABELS[order.status] ?? order.status}
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Toplam: {formatPrice(order.grandTotal, order.currency)}
        </p>
      </header>

      {order.status === 'flagged_for_review' && (
        <div className="mb-6 rounded-card border border-brass/40 bg-brass/10 px-4 py-3 text-[13px] text-ink">
          Siparişiniz güvenlik kontrolünden geçiyor. Onaylandığında ürünleriniz otomatik olarak
          teslim edilecek — bu genellikle birkaç dakika sürer.
        </div>
      )}

      {order.invoicePdfUrl && (
        <a
          href={order.invoicePdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-block rounded-full border border-brass/40 px-4 py-2 text-[12px] text-brass hover:bg-brass/10"
        >
          Faturayı indir (PDF)
        </a>
      )}

      <OrderItemsList orderUuid={order.uuid} items={order.items} />
    </main>
  );
}

function formatPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(Number(amount));
}
