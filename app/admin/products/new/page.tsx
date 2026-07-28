import { api } from '@/lib/api';
import { ProductForm } from '@/components/admin/product-form';

export default async function NewProductPage() {
  const { data: categories } = await api.categories.list();

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Yeni ürün</h1>
      <ProductForm categories={categories} />
    </main>
  );
}
