'use client';

import { useRequireStaff } from '@/components/auth/use-require-staff';

/**
 * `app/admin/` altındaki TÜM sayfalar bu layout'tan geçer — tek bir yerde
 * kimlik/rol kontrolü yapılır, her admin sayfasına tekrar tekrar eklenmesine
 * gerek kalmaz. Gerçek yetki (hangi role hangi işlem) her zaman backend'deki
 * `permission:*` middleware'i tarafından da ayrıca doğrulanır — bu sadece
 * istemci tarafında gereksiz UI gösterimini engelleyen bir ön kontrol.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isForbidden } = useRequireStaff();

  if (isForbidden) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-lg text-ink">Bu alana erişim yetkiniz yok</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Yönetim paneline erişebilmek için personel hesabıyla giriş yapmanız gerekir.
        </p>
      </main>
    );
  }

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
