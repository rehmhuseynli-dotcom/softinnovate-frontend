'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Checkout, sipariş takip ve destek sayfaları gibi kimlik doğrulama gerektiren
 * client component'lerin başında çağrılır. Oturum yokken sayfayı render
 * etmeden `/login`'e yönlendirir (dönüş adresi `redirect` query param'ında).
 */
export function useRequireAuth(): { isReady: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      const redirectTo = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [isLoading, user, router]);

  return { isReady: !isLoading && !!user };
}
