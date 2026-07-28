'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/**
 * Kullanıcı paneline (ör. /support veya profil sayfasına) eklenecek bir
 * "Bildirimleri aç" düğmesi. Tarayıcı desteklemiyorsa (ör. Safari'nin eski
 * sürümleri) hiçbir şey render etmez.
 */
export function PushNotificationOptIn() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'unsupported' | 'denied'>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');

      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => setStatus('unsupported'));
  }, []);

  async function handleEnable() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');

      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await api.pushSubscriptions.subscribe(subscription.toJSON() as never);
    setStatus('subscribed');
  }

  if (status === 'unsupported' || status === 'subscribed') {
    return null;
  }

  return (
    <button
      onClick={handleEnable}
      className="rounded-full border border-brass/40 px-3 py-1.5 text-[12px] text-brass hover:bg-brass/10"
    >
      {status === 'denied' ? 'Bildirimler engellendi' : 'Bildirimleri aç'}
    </button>
  );
}

// VAPID genel anahtarı base64url formatından Uint8Array'e çevirir (Push API'nin beklediği format).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
