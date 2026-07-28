'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, type AdminProduct } from '@/lib/api';

const DELIVERY_TYPES = [
  { value: 'code', label: 'Dijital kod' },
  { value: 'pin', label: 'PIN kodu' },
  { value: 'license_key', label: 'Lisans anahtarı' },
  { value: 'account_credentials', label: 'Hesap bilgisi' },
  { value: 'file', label: 'Dosya' },
] as const;

interface ProductFormProps {
  categories: { id: number; name: string }[];
  initialProduct?: AdminProduct;
}

export function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [nameTr, setNameTr] = useState(initialProduct?.translations.tr.name ?? '');
  const [descTr, setDescTr] = useState(initialProduct?.translations.tr.shortDescription ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(initialProduct?.categoryId ?? '');
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice ?? '');
  const [deliveryType, setDeliveryType] = useState(initialProduct?.deliveryType ?? 'code');
  const [warrantyDays, setWarrantyDays] = useState(initialProduct?.warrantyDays?.toString() ?? '0');
  const [status, setStatus] = useState(initialProduct?.status ?? 'draft');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      sku,
      category_id: categoryId,
      base_price: basePrice,
      delivery_type: deliveryType,
      warranty_days: Number(warrantyDays),
      status,
      translations: { tr: { name: nameTr, short_description: descTr } },
    };

    try {
      if (isEditing && initialProduct) {
        await api.adminProducts.update(initialProduct.id, payload);
        router.refresh();
      } else {
        const { data } = await api.adminProducts.create(payload);
        router.push(`/admin/products/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU">
          <input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            className={inputClass}
          />
        </Field>

        <Field label="Kategori">
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Seçin…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Ürün adı (Türkçe)">
        <input required value={nameTr} onChange={(e) => setNameTr(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Kısa açıklama (Türkçe)">
        <textarea
          value={descTr}
          onChange={(e) => setDescTr(e.target.value)}
          rows={3}
          className={`${inputClass} !rounded-card`}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Fiyat (TRY)">
          <input
            required
            type="number"
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Teslim tipi">
          <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as typeof deliveryType)} className={inputClass}>
            {DELIVERY_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Garanti (gün)">
          <input
            type="number"
            min={0}
            value={warrantyDays}
            onChange={(e) => setWarrantyDays(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Durum">
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
          <option value="draft">Taslak</option>
          <option value="active">Aktif</option>
          <option value="archived">Arşivlendi</option>
        </select>
      </Field>

      {error && (
        <p className="rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-[13px] text-coral">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-full bg-brass px-4 py-3 text-[14px] font-medium text-brass-ink
                   hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Kaydediliyor…' : isEditing ? 'Değişiklikleri kaydet' : 'Ürünü oluştur'}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[14px] text-ink focus:border-brass';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
