'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';

interface ThemeItem {
  id: number;
  name: string;
  isActive: boolean;
  tokens: Record<string, string>;
}

const DEFAULT_TOKENS = {
  primaryColor: '#C9A24D',
  backgroundColor: '#12101A',
  surfaceColor: '#1C1826',
  textColor: '#F5F1EA',
  fontFamily: 'Space Grotesk',
  borderRadius: '14px',
};

const TOKEN_LABELS: Record<keyof typeof DEFAULT_TOKENS, string> = {
  primaryColor: 'Ana renk (vurgu)',
  backgroundColor: 'Zemin rengi',
  surfaceColor: 'Kart yüzeyi rengi',
  textColor: 'Metin rengi',
  fontFamily: 'Font ailesi',
  borderRadius: 'Köşe yuvarlaklığı',
};

export default function ThemeSettingsPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newTokens, setNewTokens] = useState(DEFAULT_TOKENS);
  const [isSaving, setIsSaving] = useState(false);

  function reload() {
    api.adminThemes
      .list()
      .then(({ data }) => setThemes(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Yüklenemedi.'));
  }

  useEffect(reload, []);

  async function handleActivate(id: number) {
    await api.adminThemes.activate(id);
    reload();
  }

  async function handleDelete(id: number) {
    try {
      await api.adminThemes.remove(id);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Silinemedi.');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    try {
      await api.adminThemes.create(newName, newTokens);
      setNewName('');
      setNewTokens(DEFAULT_TOKENS);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
        <h1 className="font-display text-2xl font-medium text-ink">Tema</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Renk paleti, font ve köşe yuvarlaklığı gibi tasarım token'larını yönetin. Aktif olmayan
          temalar silinmediği sürece listede kalır — tek tıkla eski temaya dönebilirsiniz.
        </p>
      </header>

      {error && <p className="mb-4 text-[13px] text-coral">{error}</p>}

      <ul className="mb-8 space-y-2">
        {themes.map((theme) => (
          <li
            key={theme.id}
            className="flex items-center justify-between rounded-card border border-border bg-bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-6 w-6 rounded-full border border-border"
                style={{ backgroundColor: theme.tokens.primaryColor }}
              />
              <span className="text-[14px] text-ink">{theme.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {theme.isActive ? (
                <span className="rounded-full bg-mint/20 px-3 py-1 text-[11px] font-medium text-mint">Aktif</span>
              ) : (
                <>
                  <button
                    onClick={() => handleActivate(theme.id)}
                    className="rounded-full border border-brass/40 px-3 py-1 text-[11px] text-brass hover:bg-brass/10"
                  >
                    Aktive et
                  </button>
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="rounded-full px-2 py-1 text-[11px] text-coral hover:bg-coral/10"
                  >
                    Sil
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="space-y-3 rounded-card border border-border bg-bg-surface p-4">
        <h2 className="font-display text-[15px] font-medium text-ink">Yeni tema oluştur</h2>

        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tema adı (ör. Yılbaşı Kampanyası)"
          className="w-full rounded-full border border-border bg-bg-surface2 px-4 py-2.5 text-[13px] text-ink"
        />

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DEFAULT_TOKENS) as (keyof typeof DEFAULT_TOKENS)[]).map((key) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[12px] text-ink-muted">{TOKEN_LABELS[key]}</span>
              <input
                value={newTokens[key]}
                onChange={(e) => setNewTokens((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-full border border-border bg-bg-surface2 px-3 py-2 font-mono text-[12px] text-ink"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-brass px-4 py-2.5 text-[13px] font-medium text-brass-ink hover:bg-brass-hover disabled:opacity-60"
        >
          {isSaving ? 'Kaydediliyor…' : 'Temayı oluştur'}
        </button>
      </form>
    </main>
  );
}
