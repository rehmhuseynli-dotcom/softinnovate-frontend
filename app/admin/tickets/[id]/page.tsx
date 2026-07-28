'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError, type AdminTicket } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Açık' },
  { value: 'pending_staff', label: 'Yanıt bekliyor' },
  { value: 'pending_customer', label: 'Müşteri bekleniyor' },
  { value: 'resolved', label: 'Çözüldü' },
  { value: 'closed', label: 'Kapatıldı' },
] as const;

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [reply, setReply] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminTickets.get(ticketId).then(({ data }) => setTicket(data));
  }, [ticketId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const { data: newMessage } = await api.adminTickets.reply(ticketId, reply, isInternalNote);
      setTicket((prev) => (prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev));
      setReply('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yanıt gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  }

  async function handleStatusChange(status: AdminTicket['status']) {
    const { data } = await api.adminTickets.updateStatus(ticketId, status);
    setTicket(data);
  }

  if (!ticket) {
    return <main className="mx-auto max-w-2xl px-6 py-12 text-[13px] text-ink-muted">Yükleniyor…</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-4">
        <span className="font-mono text-[11px] text-ink-faint">{ticket.ticketNumber}</span>
        <h1 className="mt-1 font-display text-xl font-medium text-ink">{ticket.subject}</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          {ticket.customerName} · {ticket.department}
          {ticket.orderNumber && ` · Sipariş ${ticket.orderNumber}`}
        </p>
      </header>

      {/* Durum kontrolü */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatusChange(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
              ticket.status === opt.value
                ? 'border-brass bg-brass/10 text-ink'
                : 'border-border text-ink-muted hover:border-border-strong'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mesaj geçmişi — dahili notlar farklı renkte işaretlenir */}
      <ul className="space-y-3">
        {ticket.messages.map((message) => (
          <li
            key={message.id}
            className={`rounded-card border px-4 py-3 ${
              message.isInternalNote
                ? 'border-brass/40 bg-brass/5'
                : message.isFromStaff
                  ? 'border-mint/30 bg-mint/5'
                  : 'border-border bg-bg-surface'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] font-medium text-ink">
                {message.authorName}
                {message.isInternalNote && ' · Dahili not (müşteri görmez)'}
              </span>
              <span className="font-mono text-[10px] text-ink-faint">
                {new Date(message.createdAt).toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] text-ink">{message.message}</p>
          </li>
        ))}
      </ul>

      {/* Yanıt formu */}
      <form onSubmit={handleReply} className="mt-4 flex flex-col gap-2">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={4}
          placeholder={isInternalNote ? 'Sadece ekip görecek not…' : 'Müşteriye yanıt yazın…'}
          className="w-full rounded-card border border-border bg-bg-surface2 px-4 py-3
                     text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-ink-muted">
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-brass"
            />
            Dahili not (müşteriye gönderilmez)
          </label>

          <button
            type="submit"
            disabled={isSending}
            className="rounded-full bg-brass px-4 py-2 text-[13px] font-medium text-brass-ink
                       hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Gönderiliyor…' : isInternalNote ? 'Notu ekle' : 'Yanıtla'}
          </button>
        </div>

        {error && <p className="text-[12px] text-coral">{error}</p>}
      </form>
    </main>
  );
}
