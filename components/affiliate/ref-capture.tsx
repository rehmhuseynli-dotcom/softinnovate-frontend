'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Herhangi bir sayfaya `?ref=KOD123` ile gelindiğinde, bu kodu 30 gün
 * geçerli bir çereze yazar. Checkout sırasında backend bu çerezi okuyup
 * affiliate komisyonunu ilişkilendirir (bkz. CheckoutController::store).
 */
function RefCaptureInner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      document.cookie = `ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, [ref]);

  return null;
}

export function RefCapture() {
  return (
    <Suspense fallback={null}>
      <RefCaptureInner />
    </Suspense>
  );
}
