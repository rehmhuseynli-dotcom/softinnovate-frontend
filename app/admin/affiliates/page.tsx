'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Awaited<ReturnType<typeof api.adminAffiliates.list>>['data']>([]);
  const [statusFilter, setStatusFilter] = useState('');

  function reload() {
    api.adminAffiliates.list(statusFilter || undefined).then(({ data }) => setAffiliates(data));
  }

  useEffect(reload, [statusFilter]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
        <h1 className="font-display text-2xl font-medium text-ink">Affiliate Başvuruları</h1>
      </header>

      <div className="mb-4 flex gap-2">
        {['', 'pending', 'approved', 'suspended'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-[12px] ${
              statusFilter === s ? 'border-brass bg-brass/10 text-ink' : 'border-border text-ink-muted'
            }`}
          >
            {s || 'Tümü'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-bg-surface2 text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Kullanıcı</th>
              <th className="px-4 py-2.5 font-medium">Kod</th>
              <th className="px-4 py-2.5 font-medium">Oran</th>
              <th className="px-4 py-2.5 font-medium">Bekleyen / Ödenen</th>
              <th className="px-4 py-2.5 font-medium">Durum</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="text-ink">{a.userName}</p>
                  <p className="text-[11px] text-ink-faint">{a.userEmail}</p>
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted">{a.referralCode}</td>
                <td className="px-4 py-3 font-mono text-ink-muted">%{a.commissionRate}</td>
                <td className="px-4 py-3 font-mono text-ink-muted">
                  {a.totalPending} / {a.totalPaid} TRY
                </td>
                <td className="px-4 py-3 text-ink-muted">{a.status}</td>
                <td className="px-4 py-3">
                  {a.status === 'pending' && (
                    <button
                      onClick={() => api.adminAffiliates.approve(a.id).then(reload)}
                      className="rounded-full border border-mint/40 px-3 py-1 text-[11px] text-mint hover:bg-mint/10"
                    >
                      Onayla
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button
                      onClick={() => api.adminAffiliates.suspend(a.id).then(reload)}
                      className="rounded-full border border-coral/40 px-3 py-1 text-[11px] text-coral hover:bg-coral/10"
                    >
                      Askıya al
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
