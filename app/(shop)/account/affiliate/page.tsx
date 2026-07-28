'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';

type AffiliateData = NonNullable<Awaited<ReturnType<typeof api.affiliate.get>>['data']>;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Onay bekleniyor',
  approved: 'Onaylandı',
  suspended: 'Askıya alındı',
};

export default function AffiliatePage() {
  const { isReady } = useRequireAuth();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    api.affiliate.get().then(({ data }) => {
      setAffiliate(data);
      setIsLoading(false);
    });
  }, [isReady]);

  async function handleApply() {
    const { data } = await api.affiliate.apply();
    setAffiliate(data);
  }

  function handleCopy() {
    if (!affiliate) return;
    navigator.clipboard.writeText(affiliate.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!isReady || isLoading) return null;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Referans Programı</span>
        <h1 className="font-display text-2xl font-medium text-ink">Affiliate Panelim</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Kendi bağlantınızı paylaşın, sizin üzerinizden gelen her ödenmiş siparişten komisyon kazanın.
        </p>
      </header>

      {!affiliate ? (
        <div className="rounded-card border border-dashed border-border py-12 text-center">
          <p className="text-[14px] text-ink">Henüz bir affiliate hesabınız yok.</p>
          <button
            onClick={handleApply}
            className="mt-4 rounded-full bg-brass px-5 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover"
          >
            Affiliate olmak için başvur
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-card border border-border bg-bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-muted">Durum</span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  affiliate.status === 'approved'
                    ? 'bg-mint/20 text-mint'
                    : affiliate.status === 'pending'
                      ? 'bg-brass/20 text-brass'
                      : 'bg-coral/20 text-coral'
                }`}
              >
                {STATUS_LABELS[affiliate.status]}
              </span>
            </div>

            {affiliate.status === 'approved' && (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-full bg-bg-surface2 px-4 py-2 font-mono text-[13px] text-ink">
                    {affiliate.referralUrl}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="rounded-full border border-brass/40 px-3 py-2 text-[12px] text-brass hover:bg-brass/10"
                  >
                    {copied ? 'Kopyalandı ✓' : 'Kopyala'}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-[12px]">
                  <div>
                    <p className="text-ink-faint">Komisyon oranı</p>
                    <p className="mt-1 text-ink">%{affiliate.commissionRate}</p>
                  </div>
                  <div>
                    <p className="text-ink-faint">Bekleyen</p>
                    <p className="mt-1 text-brass">{affiliate.totalPending} TRY</p>
                  </div>
                  <div>
                    <p className="text-ink-faint">Kazanılan</p>
                    <p className="mt-1 text-mint">{affiliate.totalEarned} TRY</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {affiliate.commissions.length > 0 && (
            <div className="rounded-card border border-border bg-bg-surface p-5">
              <h2 className="font-display text-[14px] font-medium text-ink">Komisyon geçmişi</h2>
              <ul className="mt-3 space-y-2">
                {affiliate.commissions.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-[13px]">
                    <span className="font-mono text-ink-muted">{c.orderNumber ?? '—'}</span>
                    <span className="text-ink">{c.amount} TRY</span>
                    <span className="text-[11px] text-ink-faint">{c.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
