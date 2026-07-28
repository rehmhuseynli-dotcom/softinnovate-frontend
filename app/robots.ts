import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

/**
 * Next.js'in yerleşik robots.ts kuralı — /robots.txt olarak sunulur (madde 12).
 * Admin panel ve checkout/sipariş sayfaları arama motorlarına kapalı —
 * bunlar zaten auth arkasında ama indexlenmemesi de ayrıca istenir.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/checkout', '/orders', '/support'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
