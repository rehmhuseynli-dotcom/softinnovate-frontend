import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { AddToCartButton } from './add-to-cart-button';

export const revalidate = 60; // ISR — madde 1.1: "ürün sayfaları ISR"

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  pin: 'PIN kodu',
  code: 'Dijital kod',
  license_key: 'Lisans anahtarı',
  file: 'Dosya',
  account_credentials: 'Hesap bilgisi',
};

async function getProduct(slug: string) {
  try {
    const { data } = await api.products.bySlug(slug);

    return data;
  } catch {
    return null;
  }
}

// Madde 12: SEO — başlık/meta/OpenGraph her ürün için dinamik üretilir.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Ürün bulunamadı' };
  }

  const title = `${product.name} — Anında Teslim`;
  const description = product.shortDescription ?? `${product.name} satın al, ödeme sonrası anında teslim alınır.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Madde 12: Schema.org yapılandırılmış veri — Product + Offer.
  // Arama motorları fiyat/stok bilgisini doğrudan sonuçlarda gösterebilir (rich snippet).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.sku,
    image: product.thumbnailUrl ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.currentPrice,
      availability: product.isInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `/products/${product.slug}`,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 font-mono text-[11px] text-ink-faint" aria-label="Breadcrumb">
        <a href="/products" className="hover:text-brass">Ürünler</a>
        <span className="mx-1.5">/</span>
        <span className="text-ink-muted">{product.categoryName}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="ticket-perforation flex flex-col overflow-hidden rounded-card border border-border bg-bg-surface p-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            {product.platformName ?? product.categoryName}
          </span>
          <h1 className="mt-2 font-display text-2xl font-medium text-ink">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-3 text-[14px] text-ink-muted">{product.shortDescription}</p>
          )}

          <dl className="mt-6 space-y-2 font-mono text-[12px] text-ink-faint">
            <div className="flex justify-between">
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Teslim tipi</dt>
              <dd>{DELIVERY_TYPE_LABELS[product.deliveryType]}</dd>
            </div>
            {product.warrantyDays > 0 && (
              <div className="flex justify-between">
                <dt>Garanti</dt>
                <dd>{product.warrantyDays} gün</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex flex-col justify-between rounded-card border border-border bg-bg-surface p-6">
          <div>
            <p className="font-display text-3xl font-medium text-ink">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: product.currency }).format(
                Number(product.currentPrice),
              )}
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              {product.isInStock ? `Stokta ${product.availableStockCount} adet` : 'Şu anda stokta yok'}
            </p>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
