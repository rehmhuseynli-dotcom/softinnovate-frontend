import type { Config } from 'tailwindcss';

/**
 * Tasarım Sistemi — "Erişim Kartı" konsepti (madde 3).
 * Bu platform PIN/kod/lisans/hesap satıyor: her ürün, dijital bir "erişim kartı"
 * gibi tasarlandı — üst şeritte platform/kategori, delikli bilet kenarı, altta
 * fiyat ve "anında teslim" rozeti. Renk paleti koyu aubergine zemin + pirinç/altın
 * vurgu — "güvenli kasa" hissi, klişe cream+terracotta veya siyah+neon değil.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#12101A', // sayfa zemini — koyu aubergine
          surface: '#1C1826', // kart zemini
          surface2: '#241F30', // ikincil yüzey (dropdown, modal)
          raised: '#2C2636', // hover/aktif yüzey
        },
        border: {
          DEFAULT: '#34303F',
          strong: '#4A4457',
        },
        ink: {
          DEFAULT: '#F5F1EA', // ana metin — sıcak fildişi
          muted: '#9A93A8', // ikincil metin
          faint: '#6B647C', // en soluk metin (placeholder)
        },
        brass: {
          // vurgu rengi — "anahtar/kart" metaforunun rengi
          DEFAULT: '#C9A24D',
          hover: '#DBB666',
          ink: '#2B1F06', // brass zemin üzerinde metin
        },
        mint: {
          DEFAULT: '#6FCF9E', // başarı / doğrulandı / stokta
          ink: '#0B2E1D',
        },
        coral: {
          DEFAULT: '#E2635A', // hata / stok tükendi / iptal
          ink: '#3D0F0B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'], // Space Grotesk
        body: ['var(--font-body)', 'sans-serif'], // Inter
        mono: ['var(--font-mono)', 'monospace'], // IBM Plex Mono — kodlar, fiyatlar
      },
      borderRadius: {
        card: '14px',
      },
      spacing: {
        // 4px tabanlı grid (madde 3.1)
        18: '4.5rem',
      },
      keyframes: {
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '100%': { transform: 'translateY(220%)', opacity: '0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.75)' },
        },
      },
      animation: {
        'scan-sweep': 'scan-sweep 1.8s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
