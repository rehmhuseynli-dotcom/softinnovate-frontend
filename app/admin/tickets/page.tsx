'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError, type AdminTicket } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  open: 'Açık',
  pending_customer: 'Müşteri bekleniyor',
  pending_staff: 'Yanıt bekliyor',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-coral/20 text-coral',
  high: 'bg-brass/20 text-brass',
  normal: 'bg-bg-surface2 text-ink-muted',
  low: 'bg-bg-surface2 text-ink-faint',
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [slaOnly, setSlaOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    api.adminTickets
      .list({
        status: statusFilter || undefined,
        sla_breached_only: slaOnly || undefined,
      })
      .then(({ data }) => {
        if (!cancelled) setTickets(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Talepler yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, slaOnly]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
        <h1 className="font-display text-2xl font-medium text-ink">Destek Talepleri</h1>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['', 'open', 'pending_staff', 'pending_customer', 'resolved', 'closed'].map((status) => (
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

        <button
          onClick={() => setSlaOnly((v) => !v)}
          className={`ml-auto rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
            slaOnly ? 'border-coral bg-coral/10 text-coral' : 'border-border text-ink-muted'
          }`}
        >
          Sadece SLA ihlalleri
        </button>
      </div>

      {error && <p className="text-[13px] text-coral">{error}</p>}
      {isLoading && <p className="text-[13px] text-ink-muted">Yükleniyor…</p>}

      {!isLoading && tickets.length === 0 && (
        <p className="rounded-card border border-dashed border-border py-12 text-center text-[13px] text-ink-muted">
          Bu filtrelere uyan talep yok.
        </p>
      )}

      <ul className="space-y-2">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              href={`/admin/tickets/${ticket.id}`}
              className="flex items-center justify-between gap-4 rounded-card border border-border
                         bg-bg-surface px-4 py-3 transition-colors hover:border-border-strong"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-faint">{ticket.ticketNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  {ticket.slaBreached && (
                    <span className="rounded-full bg-coral/20 px-2 py-0.5 text-[10px] font-medium text-coral">
                      SLA İhlali
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[14px] text-ink">{ticket.subject}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {ticket.customerName} · {ticket.department}
                  {ticket.assigneeName && ` · ${ticket.assigneeName}'a atandı`}
                </p>
              </div>
              <span className="shrink-0 text-[12px] text-ink-muted">{STATUS_LABELS[ticket.status]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
