'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, type AdminPaymentMethod } from '@/lib/api';

const TYPE_LABELS: Record<AdminPaymentMethod['type'], string> = {
  card: 'Kredi/Banka Kartı',
  wallet_transfer: 'Cüzdan',
  bank_transfer: 'Banka Havalesi',
  crypto: 'Kripto Para',
  cash_on_delivery: 'Kapıda Ödeme',
  internal: 'Dahili',
};

const PROVIDER_PRESETS = {
  stripe: {
    label: 'Stripe', type: 'card' as const,
    fields: [
      { key: 'api_key', label: 'Secret Key (sk_live_...)' },
      { key: 'webhook_secret', label: 'Webhook Signing Secret (whsec_...)' },
    ],
  },
  paytr: {
    label: 'PayTR', type: 'card' as const,
    fields: [
      { key: 'merchant_id', label: 'Merchant ID' },
      { key: 'merchant_key', label: 'Merchant Key' },
      { key: 'merchant_salt', label: 'Merchant Salt' },
    ],
  },
  paypal: {
    label: 'PayPal', type: 'card' as const,
    fields: [
      { key: 'client_id', label: 'Client ID' },
      { key: 'client_secret', label: 'Client Secret' },
      { key: 'webhook_id', label: 'Webhook ID' },
    ],
  },
  crypto: {
    label: 'Kripto (NOWPayments)', type: 'crypto' as const,
    fields: [{ key: 'api_key', label: 'NOWPayments API Key' }],
  },
  bank_transfer: {
    label: 'Banka Havalesi', type: 'bank_transfer' as const,
    fields: [],
  },
} satisfies Record<string, { label: string; type: AdminPaymentMethod['type']; fields: { key: string; label: string }[] }>;

type ProviderKey = keyof typeof PROVIDER_PRESETS;

export default function PaymentMethodsSettingsPage() {
  const [methods, setMethods] = useState<AdminPaymentMethod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function reload() {
    api.paymentMethods
      .list()
      .then(({ data }) => setMethods(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Yüklenemedi.'));
  }

  useEffect(reload, []);

  async function handleToggle(method: AdminPaymentMethod) {
    try {
      const { data } = await api.paymentMethods.toggle(method.id);
      setMethods((prev) => prev.map((m) => (m.id === method.id ? data : m)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Güncellenemedi.');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
          <h1 className="font-display text-2xl font-medium text-ink">Ödeme Yöntemleri</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            API anahtarları şifreli saklanır ve bu ekranda hiçbir zaman gösterilmez.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-brass px-4 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover"
        >
          {showAddForm ? 'Vazgeç' : 'Yeni yöntem ekle'}
        </button>
      </header>

      {showAddForm && (
        <AddPaymentMethodForm
          onCreated={() => {
            setShowAddForm(false);
            reload();
          }}
        />
      )}

      {error && <p className="mb-4 text-[13px] text-coral">{error}</p>}

      <ul className="space-y-2">
        {methods.map((method) => (
          <li
            key={method.id}
            className="flex items-center justify-between rounded-card border border-border bg-bg-surface px-4 py-3.5"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-ink">{method.name}</span>
                <span className="rounded-full bg-bg-surface2 px-2 py-0.5 text-[10px] text-ink-muted">
                  {TYPE_LABELS[method.type]}
                </span>
                {!method.hasCredentialsConfigured && method.type !== 'internal' && (
                  <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[10px] text-brass">
                    API anahtarı girilmedi
                  </span>
                )}
              </div>
              {(method.minAmount || method.maxAmount) && (
                <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                  Sınır: {method.minAmount ?? '0'} – {method.maxAmount ?? '∞'}
                </p>
              )}
            </div>

            <button
              onClick={() => handleToggle(method)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                method.isActive ? 'bg-mint/20 text-mint' : 'bg-bg-surface2 text-ink-muted'
              }`}
            >
              {method.isActive ? 'Aktif' : 'Pasif'}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

function AddPaymentMethodForm({ onCreated }: { onCreated: () => void }) {
  const [provider, setProvider] = useState<ProviderKey>('stripe');
  const [name, setName] = useState(PROVIDER_PRESETS.stripe.label);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = PROVIDER_PRESETS[provider];

  function handleProviderChange(key: ProviderKey) {
    setProvider(key);
    setName(PROVIDER_PRESETS[key].label);
    setFieldValues({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await api.paymentMethods.create({
        slug: provider,
        name,
        type: preset.type,
        is_active: false,
        ...fieldValues,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-card border border-border bg-bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[12px] text-ink-muted">Sağlayıcı</span>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as ProviderKey)}
            className="w-full rounded-full border border-border bg-bg-surface2 px-3 py-2 text-[13px] text-ink"
          >
            {Object.entries(PROVIDER_PRESETS).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] text-ink-muted">Görünen ad</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-border bg-bg-surface2 px-3 py-2 text-[13px] text-ink"
          />
        </label>
      </div>

      {preset.fields.map((field) => (
        <label key={field.key} className="block">
          <span className="mb-1.5 block text-[12px] text-ink-muted">{field.label}</span>
          <input
            type="password"
            value={fieldValues[field.key] ?? ''}
            onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full rounded-full border border-border bg-bg-surface2 px-3 py-2 font-mono text-[12px] text-ink"
          />
        </label>
      ))}

      {error && <p className="text-[12px] text-coral">{error}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-full bg-brass px-4 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover disabled:opacity-60"
      >
        {isSaving ? 'Kaydediliyor…' : 'Yöntemi ekle (pasif olarak)'}
      </button>
    </form>
  );
}
