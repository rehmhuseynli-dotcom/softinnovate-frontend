'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

type Step = 'welcome' | 'admin-account' | 'done';

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [siteName, setSiteName] = useState('Dijital Hesap Satış Platformu');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.setup.complete({
        site_name: siteName,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
        admin_password_confirmation: adminPasswordConfirmation,
        default_locale: 'tr',
      });
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kurulum tamamlanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-2">
        {(['welcome', 'admin-account', 'done'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              (['welcome', 'admin-account', 'done'] as Step[]).indexOf(step) >= i ? 'bg-brass' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {step === 'welcome' && (
        <div>
          <h1 className="font-display text-2xl font-medium text-ink">Platforma hoş geldiniz</h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            Kurulumu tamamlamak için birkaç adım kaldı. Önce Owner (sahip) hesabınızı oluşturacağız —
            bu hesap platformun tüm yetkilerine sahip olacak.
          </p>
          <button
            onClick={() => setStep('admin-account')}
            className="mt-6 w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink hover:bg-brass-hover"
          >
            Başla
          </button>
        </div>
      )}

      {step === 'admin-account' && (
        <form onSubmit={handleComplete}>
          <h1 className="font-display text-2xl font-medium text-ink">Owner hesabı oluştur</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            Bu bilgileri güvenli bir yerde saklayın — daha sonra admin panelden yeni personel
            ekleyebilirsiniz.
          </p>

          <div className="mt-6 space-y-3">
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Site adı"
              className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink"
            />
            <input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink"
            />
            <input
              required
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink"
            />
            <input
              required
              type="password"
              minLength={8}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Şifre (en az 8 karakter)"
              className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink"
            />
            <input
              required
              type="password"
              value={adminPasswordConfirmation}
              onChange={(e) => setAdminPasswordConfirmation(e.target.value)}
              placeholder="Şifre (tekrar)"
              className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink"
            />
          </div>

          {error && (
            <p className="mt-3 rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-[13px] text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink hover:bg-brass-hover disabled:opacity-60"
          >
            {isSubmitting ? 'Kuruluyor…' : 'Kurulumu tamamla'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div>
          <h1 className="font-display text-2xl font-medium text-ink">Kurulum tamamlandı 🎉</h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            Owner hesabınız oluşturuldu ve giriş yaptınız. Şimdi admin panelden ürün eklemeye
            başlayabilirsiniz.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-6 w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink hover:bg-brass-hover"
          >
            Yönetim paneline git
          </button>
        </div>
      )}
    </main>
  );
}
