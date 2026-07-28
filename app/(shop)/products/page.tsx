import { api } from '@/lib/api';
import { ProductCard } from '@/components/ui/product-card';

// Ürün sayfaları ISR ile önbelleklenir (madde 1.1: "ürün sayfaları ISR")
export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; platform?: string; search?: string }>;
}) {
  const params = await searchParams;
  const { data: products } = await api.products.list(params);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">
          Dijital erişim kartları
        </span>
        <h1 className="font-display text-3xl font-medium text-ink">Tüm ürünler</h1>
        <p className="max-w-2xl text-[14px] text-ink-muted">
          Satın aldığınız her kod, ödeme onaylandığı anda hesabınıza teslim edilir.
        </p>
      </header>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-24 text-center">
      <p className="font-display text-lg text-ink">Bu kriterlere uyan ürün bulunamadı</p>
      <p className="mt-1 text-[13px] text-ink-muted">Filtreleri değiştirip tekrar deneyin.</p>
    </div>
  );
}
