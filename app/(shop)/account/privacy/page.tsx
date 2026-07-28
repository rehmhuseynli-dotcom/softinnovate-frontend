'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/components/auth/use-require-auth';

export default function PrivacyPage() {
  const { isReady } = useRequireAuth();
  const router = useRouter();

  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    try {
      const data = await api.accountPrivacy.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verilerim-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setIsDeleting(true);
    setError(null);

    try {
      await api.accountPrivacy.requestDeletion(password);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İşlem tamamlanamadı.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isReady) return null;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Hesap</span>
        <h1 className="font-display text-2xl font-medium text-ink">Gizlilik ve Verilerim</h1>
      </header>

      <section className="rounded-card border border-border bg-bg-surface p-5">
        <h2 className="font-display text-[15px] font-medium text-ink">Verilerimi indir</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Profil bilgileriniz, sipariş geçmişiniz, destek talepleriniz ve cüzdan hareketleriniz
          tek bir JSON dosyası olarak indirilir (KVKK/GDPR veri taşınabilirliği hakkı).
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="mt-3 rounded-full border border-brass/40 px-4 py-2 text-[13px] text-brass hover:bg-brass/10 disabled:opacity-60"
        >
          {isExporting ? 'Hazırlanıyor…' : 'Verilerimi indir (JSON)'}
        </button>
      </section>

      <section className="mt-4 rounded-card border border-coral/30 bg-coral/5 p-5">
        <h2 className="font-display text-[15px] font-medium text-ink">Hesabımı sil</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Hesabınız kalıcı olarak <strong>anonimleştirilir</strong> — adınız, e-postanız ve telefon
          numaranız geri döndürülemez şekilde silinir ve hesabınıza tekrar giriş yapılamaz.
          Yasal muhasebe kayıtları (siparişler, faturalar) mevzuat gereği saklanmaya devam eder.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-3 rounded-full border border-coral/40 px-4 py-2 text-[13px] text-coral hover:bg-coral/10"
          >
            Hesabımı silmek istiyorum
          </button>
        ) : (
          <form onSubmit={handleDelete} className="mt-3 space-y-2">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Onaylamak için şifrenizi girin"
              className="w-full rounded-full border border-coral/30 bg-bg-surface2 px-4 py-2.5 text-[13px] text-ink"
            />
            {error && <p className="text-[12px] text-coral">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-full bg-coral px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isDeleting ? 'Siliniyor…' : 'Kalıcı olarak sil'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full border border-border px-4 py-2 text-[13px] text-ink-muted"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
