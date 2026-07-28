'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Ticket } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';

const STATUS_LABELS: Record<string, string> = {
  open: 'Açık',
  pending_customer: 'Yanıtınız bekleniyor',
  pending_staff: 'Ekibimiz yanıtlayacak',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'text-mint',
  pending_customer: 'text-brass',
  pending_staff: 'text-ink-muted',
  resolved: 'text-ink-faint',
  closed: 'text-ink-faint',
};

export default function SupportPage() {
  const { isReady } = useRequireAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    api.tickets
      .list()
      .then(({ data }) => setTickets(data))
      .finally(() => setIsLoading(false));
  }, [isReady]);

  if (!isReady) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Destek</span>
          <h1 className="font-display text-2xl font-medium text-ink">Taleplerim</h1>
        </div>

        <Link
          href="/support/new"
          className="rounded-full bg-brass px-4 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover"
        >
          Yeni talep
        </Link>
      </header>

      {isLoading ? (
        <p className="text-[13px] text-ink-muted">Yükleniyor…</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-card border border-dashed border-border py-16 text-center">
          <p className="font-display text-[15px] text-ink">Henüz bir destek talebiniz yok</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Bir sorun mu var? Sağ üstteki butonla yeni bir talep oluşturabilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/support/${ticket.id}`}
                className="ticket-perforation flex items-center justify-between rounded-card border
                           border-border bg-bg-surface px-4 py-3.5 transition-colors hover:border-border-strong"
              >
                <div>
                  <p className="font-mono text-[11px] text-ink-faint">{ticket.ticketNumber}</p>
                  <p className="mt-0.5 text-[14px] text-ink">{ticket.subject}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{ticket.department}</p>
                </div>
                <span className={`text-[12px] font-medium ${STATUS_COLORS[ticket.status] ?? 'text-ink-muted'}`}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
