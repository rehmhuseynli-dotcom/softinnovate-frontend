'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';

const DEPARTMENTS = [
  { slug: 'technical', label: 'Teknik Destek' },
  { slug: 'billing', label: 'Ödeme ve Faturalama' },
  { slug: 'general', label: 'Genel Sorular' },
] as const;

export default function NewTicketPage() {
  const { isReady } = useRequireAuth();
  const router = useRouter();
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0].slug);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: ticket } = await api.tickets.create({ department, subject, message });
      router.push(`/support/${ticket.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Talep oluşturulamadı.');
      setIsSubmitting(false);
    }
  }

  if (!isReady) return null;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Yeni destek talebi</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] text-ink-muted">Departman</label>
          <div className="grid grid-cols-3 gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setDepartment(d.slug)}
                className={`rounded-card border px-3 py-2.5 text-[12px] transition-colors ${
                  department === d.slug
                    ? 'border-brass bg-brass/10 text-ink'
                    : 'border-border text-ink-muted hover:border-border-strong'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-[13px] text-ink-muted">
            Konu
          </label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Kısaca ne hakkında olduğunu yazın"
            className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5
                       text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-[13px] text-ink-muted">
            Mesajınız
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sorununuzu ayrıntılı olarak anlatın"
            className="w-full rounded-card border border-border bg-bg-surface2 px-4 py-3
                       text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
          />
        </div>

        {error && (
          <p className="rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-[13px] text-coral">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brass px-4 py-3.5 text-[15px] font-medium text-brass-ink
                     transition-opacity hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Gönderiliyor…' : 'Talebi gönder'}
        </button>
      </form>
    </main>
  );
}
