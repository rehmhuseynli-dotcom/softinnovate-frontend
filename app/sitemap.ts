import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

/**
 * Next.js'in yerleşik sitemap.ts kuralı — /sitemap.xml olarak sunulur (madde 12).
 * Ürün sayfaları dinamik olarak API'den çekilir; statik sayfalar elle eklenir.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/support`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  let productPages: MetadataRoute.Sitemap = [];

  try {
    const { data: products } = await api.products.list();

    productPages = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      changeFrequency: 'daily',
      priority: 0.8,
      // Çok dilli hreflang alternates (madde 12: "sitemap otomatik, çok dilli
      // hreflang etiketleriyle"). Next.js'in sitemap tipi `alternates.languages`
      // destekler ve <xhtml:link rel="alternate" hreflang="..."> olarak render eder.
      alternates: {
        languages: {
          tr: `${SITE_URL}/products/${product.slug}?locale=tr`,
          en: `${SITE_URL}/products/${product.slug}?locale=en`,
        },
      },
    }));
  } catch {
    // API erişilemezse sitemap boş ürün listesiyle de olsa geçerli kalmalı —
    // build'i tamamen kırmamak için sessizce boş dizi dönülür.
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
