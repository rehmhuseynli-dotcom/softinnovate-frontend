'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Admin panel route'larını korur: oturum yoksa /login'e, oturum var ama
 * hiçbir rolü yoksa (sıradan müşteri) 403 benzeri bir mesaja yönlendirir.
 * Gerçek yetki kontrolü (hangi role hangi işlemi yapabilir) zaten backend'de
 * her uç noktada `permission:*` middleware'i ile yapılıyor — bu hook sadece
 * "bu kişi hiç personel mi değil mi" düzeyinde bir ön kontrol, UI'ı boşuna
 * göstermemek için.
 */
export function useRequireStaff(): { isReady: boolean; isForbidden: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isStaff = !!user && user.roles.length > 0;
  const isForbidden = !isLoading && !!user && !isStaff;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [isLoading, user, router]);

  return { isReady: !isLoading && isStaff, isForbidden };
}
