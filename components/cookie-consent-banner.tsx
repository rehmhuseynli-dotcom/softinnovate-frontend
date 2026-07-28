'use client';

import { useEffect, useState } from 'react';

type ConsentCategories = {
  necessary: true; // her zaman true, kapatılamaz
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'cookie-consent-v1';

/**
 * Madde 19: "Çerez (Cookie) yönetim paneli: kategori bazlı (zorunlu/analitik/
 * pazarlama) onay mekanizması." Bu bileşen sayfa ilk açıldığında, daha önce
 * bir tercih kaydedilmemişse gösterilir. Analytics/marketing script'leri
 * (Google Analytics, Meta Pixel vb.) bu component'in verdiği onaya göre
 * KOŞULLU olarak yüklenmelidir — o entegrasyonlar henüz eklenmedi, ama onay
 * altyapısı burada hazır (bkz. `hasConsent()` yardımcı fonksiyonu).
 */
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsVisible(true);
    }
  }, []);

  function save(consent: ConsentCategories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, savedAt: new Date().toISOString() }));
    setIsVisible(false);
  }

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true });
  }

  function rejectNonEssential() {
    save({ necessary: true, analytics: false, marketing: false });
  }

  function saveCustom() {
    save({ necessary: true, analytics, marketing });
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-surface p-4 shadow-lg">
      <div className="mx-auto max-w-3xl">
        <p className="text-[13px] text-ink">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Zorunlu çerezler sitenin çalışması
          için gerekli; analitik ve pazarlama çerezlerini tercihen açabilirsiniz.
        </p>

        {showDetails && (
          <div className="mt-3 space-y-2 rounded-card border border-border bg-bg-surface2 p-3">
            <label className="flex items-center justify-between text-[12px] text-ink-muted">
              Zorunlu çerezler (her zaman aktif)
              <input type="checkbox" checked disabled className="h-4 w-4 accent-brass" />
            </label>
            <label className="flex items-center justify-between text-[12px] text-ink-muted">
              Analitik çerezler
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 accent-brass"
              />
            </label>
            <label className="flex items-center justify-between text-[12px] text-ink-muted">
              Pazarlama çerezleri
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 accent-brass"
              />
            </label>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={acceptAll}
            className="rounded-full bg-brass px-4 py-2 text-[12px] font-medium text-brass-ink hover:bg-brass-hover"
          >
            Tümünü kabul et
          </button>
          <button
            onClick={rejectNonEssential}
            className="rounded-full border border-border px-4 py-2 text-[12px] text-ink-muted hover:border-border-strong"
          >
            Sadece zorunlu
          </button>
          {showDetails ? (
            <button onClick={saveCustom} className="rounded-full border border-border px-4 py-2 text-[12px] text-ink-muted">
              Seçimi kaydet
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="text-[12px] text-brass hover:underline"
            >
              Tercihleri özelleştir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics/marketing script'lerini koşullu yüklerken kullanılır:
 *   if (hasConsent('analytics')) { loadGoogleAnalytics(); }
 */
export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

    return Boolean(saved[category]);
  } catch {
    return false;
  }
}
