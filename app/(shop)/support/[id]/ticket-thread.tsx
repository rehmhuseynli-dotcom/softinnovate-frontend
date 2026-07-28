'use client';

import { useState } from 'react';
import type { Ticket, TicketMessage } from '@/lib/api';
import { api, ApiError } from '@/lib/api';

const CLOSED_STATUSES = ['resolved', 'closed'];

export function TicketThread({ ticket }: { ticket: Ticket }) {
  const [messages, setMessages] = useState<TicketMessage[]>(ticket.messages);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosed = CLOSED_STATUSES.includes(ticket.status);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const { data: newMessage } = await api.tickets.reply(ticket.id, reply);
      setMessages((prev) => [...prev, newMessage]);
      setReply('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="space-y-3">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`max-w-[85%] rounded-card border px-4 py-3 ${
              message.isFromStaff
                ? 'border-brass/30 bg-brass/5'
                : 'ml-auto border-border bg-bg-surface'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] font-medium text-ink">
                {message.isFromStaff ? message.authorName + ' (Destek Ekibi)' : 'Siz'}
              </span>
              <span className="font-mono text-[10px] text-ink-faint">
                {new Date(message.createdAt).toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] text-ink">{message.message}</p>
          </li>
        ))}
      </ul>

      {isClosed ? (
        <p className="rounded-card border border-border bg-bg-surface px-4 py-3 text-center text-[13px] text-ink-muted">
          Bu talep kapatıldı. Yeni bir soru için lütfen yeni bir talep oluşturun.
        </p>
      ) : (
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Yanıtınızı yazın…"
            className="w-full rounded-card border border-border bg-bg-surface2 px-4 py-3
                       text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
          />

          {error && <p className="text-[12px] text-coral">{error}</p>}

          <button
            type="submit"
            disabled={isSending}
            className="self-end rounded-full bg-brass px-4 py-2 text-[13px] font-medium text-brass-ink
                       hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </form>
      )}
    </div>
  );
}
