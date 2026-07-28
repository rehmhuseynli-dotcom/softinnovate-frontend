import type { Metadata } from 'next';
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-context';
import { RefCapture } from '@/components/affiliate/ref-capture';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  title: {
    default: 'Dijital Hesap Satış Platformu',
    template: '%s | Dijital Hesap Satış Platformu',
  },
  description: 'Anında teslim edilen dijital hesap, lisans ve kod satışı.',
  openGraph: {
    siteName: 'Dijital Hesap Satış Platformu',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeTokens = await getActiveThemeTokens();

  // Admin panelden değiştirilen tema token'ları burada CSS custom property
  // olarak :root'a enjekte edilir — tailwind.config.ts'deki renkler bu
  // değişkenlere referans vermez (statik build-time renkler kullanır), bu
  // yüzden bu inline style sadece BELİRLİ, doğrudan bu değişkenleri okuyan
  // bileşenlerde etkili olur. Tam dinamik tema desteği için tailwind.config.ts
  // içindeki renklerin de CSS var() referanslarına çevrilmesi gerekir — bu,
  // "tema sistemi" nin sonraki bir iterasyonu olarak bırakıldı (bkz. PROJECT_STATUS.md).
  const themeStyle = {
    '--theme-primary': themeTokens.primaryColor,
    '--theme-background': themeTokens.backgroundColor,
    '--theme-surface': themeTokens.surfaceColor,
    '--theme-text': themeTokens.textColor,
    '--theme-radius': themeTokens.borderRadius,
  } as React.CSSProperties;

  return (
    <html lang="tr" className={`${display.variable} ${body.variable} ${mono.variable}`} style={themeStyle}>
      <body>
        <RefCapture />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

async function getActiveThemeTokens() {
  const fallback = {
    primaryColor: '#C9A24D',
    backgroundColor: '#12101A',
    surfaceColor: '#1C1826',
    textColor: '#F5F1EA',
    fontFamily: 'Space Grotesk',
    borderRadius: '14px',
  };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/theme/active`, { next: { revalidate: 300 } });
    if (!res.ok) return fallback;

    const { data } = await res.json();

    return { ...fallback, ...data };
  } catch {
    return fallback;
  }
}
