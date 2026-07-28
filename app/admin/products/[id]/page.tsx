import { api } from '@/lib/api';
import { ProductForm } from '@/components/admin/product-form';
import { StockImportPanel } from './stock-import-panel';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: product }, { data: categories }] = await Promise.all([
    api.adminProducts.get(Number(id)),
    api.categories.list(),
  ]);

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <header className="mb-6">
        <span className="font-mono text-[11px] text-ink-faint">{product.sku}</span>
        <h1 className="font-display text-2xl font-medium text-ink">Ürünü düzenle</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Stokta {product.availableStockCount} adet · {product.salesCount} satış
        </p>
      </header>

      <ProductForm categories={categories} initialProduct={product} />

      <div className="mt-8 border-t border-border pt-6">
        <StockImportPanel productId={product.id} />
      </div>
    </main>
  );
}
