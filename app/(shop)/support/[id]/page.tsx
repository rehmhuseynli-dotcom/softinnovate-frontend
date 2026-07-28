'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, type Ticket } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';
import { TicketThread } from './ticket-thread';

export default function TicketDetailPage() {
  const { isReady } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!isReady) return;

    api.tickets.get(Number(params.id)).then(({ data }) => setTicket(data));
  }, [isReady, params.id]);

  if (!isReady || !ticket) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-6">
        <span className="font-mono text-[11px] text-ink-faint">{ticket.ticketNumber}</span>
        <h1 className="mt-1 font-display text-xl font-medium text-ink">{ticket.subject}</h1>
        <p className="mt-1 text-[13px] text-ink-muted">{ticket.department}</p>
      </header>

      <TicketThread ticket={ticket} />
    </main>
  );
}
