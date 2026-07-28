import Link from 'next/link';
import { api } from '@/lib/api';
export const dynamic = 'force-dynamic';
const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Ödeme bekliyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
  flagged_for_review: 'İnceleniyor',
};

export default async function AdminDashboardPage() {
  const stats = await api.dashboard.get();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
        <h1 className="font-display text-2xl font-medium text-ink">Genel Bakış</h1>
      </header>

      {/* Üst metrikler */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Bugünkü ciro" value={`${stats.todayRevenue} TRY`} />
        <StatCard
          label="İncelemede"
          value={String(stats.pendingReviewOrdersCount)}
          tone={stats.pendingReviewOrdersCount > 0 ? 'warn' : 'default'}
        />
        <StatCard label="Açık talep" value={String(stats.openTicketsCount)} />
        <StatCard
          label="SLA ihlali"
          value={String(stats.slaBreachedTicketsCount)}
          tone={stats.slaBreachedTicketsCount > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Düşük stok uyarısı */}
        <section className="rounded-card border border-border bg-bg-surface p-4">
          <h2 className="font-display text-[14px] font-medium text-ink">Düşük stok</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="mt-3 text-[13px] text-ink-muted">Her şey yolunda — düşük stoklu ürün yok.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between text-[13px] text-ink hover:text-brass"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-coral">{p.availableStockCount} adet</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Son siparişler */}
        <section className="rounded-card border border-border bg-bg-surface p-4">
          <h2 className="font-display text-[14px] font-medium text-ink">Son siparişler</h2>
          <ul className="mt-3 space-y-2">
            {stats.recentOrders.map((order) => (
              <li key={order.uuid} className="flex items-center justify-between text-[13px]">
                <div className="min-w-0">
                  <p className="truncate text-ink">{order.customerName ?? '—'}</p>
                  <p className="font-mono text-[11px] text-ink-faint">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-ink-muted">{order.grandTotal} TRY</p>
                  <p className="text-[11px] text-ink-faint">{STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warn' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-coral' : tone === 'warn' ? 'text-brass' : 'text-ink';

  return (
    <div className="rounded-card border border-border bg-bg-surface p-4">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className={`mt-1 font-display text-xl font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}
