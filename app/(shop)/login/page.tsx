'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/products';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl font-medium text-ink">Giriş yap</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />

        {error && (
          <p className="rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-[13px] text-coral">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink hover:bg-brass-hover disabled:opacity-60"
        >
          {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-ink-muted">
        Hesabınız yok mu?{' '}
        <Link href="/register" className="text-brass hover:underline">
          Kayıt olun
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams Suspense sınırı gerektirir (Next.js App Router kuralı).
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
