'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/components/cart/cart-store';
import { useRequireAuth } from '@/components/auth/use-require-auth';
import { api, ApiError } from '@/lib/api';

const PAYMENT_METHODS = [
  { slug: 'stripe', label: 'Kredi/Banka Kartı' },
  { slug: 'paytr', label: 'PayTR' },
  { slug: 'nowpayments', label: 'Kripto Para' },
  { slug: 'bank_transfer', label: 'Banka Havalesi' },
] as const;

type Step = 'summary' | 'creating' | 'awaiting_payment' | 'error';

export default function CheckoutPage() {
  const { isReady } = useRequireAuth();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [couponCode, setCouponCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>(PAYMENT_METHODS[0].slug);
  const [step, setStep] = useState<Step>('summary');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePay() {
    setStep('creating');
    setErrorMessage(null);

    try {
      const { order } = await api.checkout.create(items, couponCode || undefined);
      const { status } = await api.checkout.pay(order.uuid, selectedMethod);

      setStep('awaiting_payment');
      clearCart();

      // Gerçek entegrasyonda sağlayıcının checkout URL'ine yönlendirilir.
      // Şimdilik sipariş takip sayfasına gidiyoruz.
      router.push(`/orders/${order.uuid}?payment_status=${status}`);
    } catch (err) {
      setStep('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Beklenmeyen bir hata oluştu.');
    }
  }

  if (!isReady) {
    return null; // useRequireAuth zaten /login'e yönlendiriyor
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-display text-lg text-ink">Sepetiniz boş</p>
        <p className="mt-1 text-[13px] text-ink-muted">Ödemeye geçmeden önce sepetinize ürün ekleyin.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Siparişi tamamla</h1>

      <section className="mt-6 rounded-card border border-border bg-bg-surface p-5">
        <h2 className="font-display text-[15px] font-medium text-ink">Kupon kodu</h2>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Kupon kodunuz varsa girin"
          className="mt-2 w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5
                     text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />
      </section>

      <section className="mt-4 rounded-card border border-border bg-bg-surface p-5">
        <h2 className="font-display text-[15px] font-medium text-ink">Ödeme yöntemi</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.slug}
              type="button"
              onClick={() => setSelectedMethod(method.slug)}
              className={`rounded-card border px-4 py-3 text-left text-[13px] transition-colors ${
                selectedMethod === method.slug
                  ? 'border-brass bg-brass/10 text-ink'
                  : 'border-border text-ink-muted hover:border-border-strong'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </section>

      {step === 'error' && errorMessage && (
        <p className="mt-4 rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-[13px] text-coral">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={step === 'creating'}
        className="mt-6 w-full rounded-full bg-brass px-4 py-3.5 text-center text-[15px]
                   font-medium text-brass-ink transition-opacity hover:bg-brass-hover
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {step === 'creating' ? 'İşleniyor…' : 'Ödemeyi başlat'}
      </button>

      <p className="mt-3 text-center font-mono text-[11px] text-ink-faint">
        Ödeme onaylandığı anda ürünleriniz hesabınıza teslim edilir.
      </p>
    </main>
  );
}
