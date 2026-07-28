'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

type ImportResult = {
  batch: { totalRows: number; importedRows: number; failedRows: number; status: string };
};

export function StockImportPanel({ productId }: { productId: number }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.adminProducts.importStock(productId, file);
      setResult(response);
      router.refresh(); // stok sayısını güncelle
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yükleme başarısız oldu.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <h2 className="font-display text-[15px] font-medium text-ink">Toplu stok yükle</h2>
      <p className="mt-1 text-[12px] text-ink-muted">
        CSV, TXT, JSON veya XML — her satır/eleman tek bir PIN/kod/lisans olmalı.
      </p>

      <label
        className="mt-3 flex cursor-pointer items-center justify-center rounded-card border-2 border-dashed
                   border-border px-4 py-6 text-[13px] text-ink-muted hover:border-brass/50 hover:text-ink"
      >
        {isUploading ? 'Yükleniyor…' : 'Dosya seçmek için tıklayın'}
        <input
          type="file"
          accept=".csv,.txt,.json,.xml,.xlsx,.xls"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      {error && <p className="mt-2 text-[12px] text-coral">{error}</p>}

      {result && (
        <div className="mt-3 rounded-card border border-mint/30 bg-mint/5 px-4 py-3 text-[13px]">
          <p className="text-mint">
            {result.batch.importedRows} / {result.batch.totalRows} satır başarıyla eklendi
          </p>
          {result.batch.failedRows > 0 && (
            <p className="mt-1 text-coral">{result.batch.failedRows} satır hatalı, eklenmedi</p>
          )}
        </div>
      )}
    </div>
  );
}
