'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await register(name, email, password, passwordConfirmation);
      router.push('/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kayıt başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl font-medium text-ink">Hesap oluştur</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ad Soyad"
          className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre (en az 8 karakter)"
          className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brass"
        />
        <input
          type="password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Şifre (tekrar)"
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
          {isSubmitting ? 'Oluşturuluyor…' : 'Hesap oluştur'}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-ink-muted">
        Zaten hesabınız var mı?{' '}
        <Link href="/login" className="text-brass hover:underline">
          Giriş yapın
        </Link>
      </p>
    </main>
  );
}
