# Next.js Frontend — Ürün Listeleme, Sepet, Checkout

## Kurulum

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
npm install zustand
```

Fontlar (`Space Grotesk`, `Inter`, `IBM Plex Mono`) `next/font/google` ile
`app/layout.tsx` içinde yüklenmeli — bu iskelette layout dosyası dahil değil,
aşağıdaki gibi eklenmesi gerekir:

```tsx
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Tasarım Sistemi — "Erişim Kartı" Konsepti

Bu platform PIN/kod/lisans/hesap satıyor — her ürün gerçekte dijital bir
"erişim anahtarı". Tasarım bunu somutlaştırıyor:

- **Renk**: koyu aubergine zemin (`#12101A`) + pirinç/altın vurgu (`#C9A24D`) —
  "güvenli kasa" hissi. Bilinçli olarak AI-tasarımlarında sık görülen
  cream+terracotta veya siyah+neon-yeşil kalıplarından kaçınıldı.
- **Tipografi**: `Space Grotesk` (başlıklar/fiyatlar — teknik, kendinden emin),
  `Inter` (gövde metni), `IBM Plex Mono` (SKU, fiyat, garanti süresi gibi
  "veri" niteliğindeki metinler — gerçek bir lisans anahtarı gibi okunsun diye).
- **İmza öğesi**: Ürün kartları birer bilet/kart gibi **delikli kenarla**
  (`.ticket-perforation` — CSS ile üretilen "punch hole" efekti) ikiye bölünmüş;
  üstte kategori/platform + isim, altta fiyat ve "Anında teslim" rozeti.
  Hover'da kartın üzerinden ince bir **tarama çizgisi** geçiyor — bir kartın
  okuyucudan geçirilmesi hissini veriyor (`animate-scan-sweep`).
- **Erişilebilirlik**: `prefers-reduced-motion` desteklendiği için tüm
  animasyonlar (tarama çizgisi, nabız noktası) bu tercihte devre dışı kalır
  (madde 3.3, 3.4).

## Dosya Yapısı

```
tailwind.config.ts       — tüm tasarım token'ları (renk, tipografi, animasyon)
app/globals.css          — font değişkenleri, focus-visible, ticket-perforation
lib/api.ts                — Laravel API'sine (bkz. backend Services/Controllers) bağlanan istemci
components/ui/product-card.tsx   — imza tasarım öğesini taşıyan ürün kartı
components/cart/cart-store.ts    — zustand + localStorage persist (misafir sepeti)
components/cart/cart-drawer.tsx  — sepet paneli
app/(shop)/products/page.tsx     — ISR'li ürün listeleme (revalidate: 60 — madde 1.1)
app/(shop)/checkout/page.tsx     — kupon + ödeme yöntemi seçimi, backend'e bağlı
```

## Backend Bağlantısı

`lib/api.ts` daha önce yazılan Laravel uç noktalarını çağırıyor:
- `POST /api/v1/checkout` → `CheckoutController::store` → `OrderService::createFromCart`
- `POST /api/v1/checkout/{order}/pay` → `CheckoutController::pay` → `PaymentService::initiate`

Yani bu frontend, önceki adımlarda yazılan backend'in üzerine **doğrudan
oturacak şekilde** tasarlandı — alan adları (`product_id`, `coupon_code`,
`payment_method`) birebir eşleşiyor.

## Bilerek Eksik/Basitleştirilmiş Bırakılanlar

- `GET /api/v1/products` endpoint'i backend'de henüz yazılmadı — `lib/api.ts`
  bunu çağırmaya hazır ama controller'ı bir sonraki turda eklenmeli.
- Checkout sayfasında gerçek sağlayıcı checkout URL'ine yönlendirme yok —
  `PaymentService::initiate()` şu an sadece bir `PaymentTransaction` açıyor,
  sağlayıcı SDK entegrasyonu (Stripe Elements, PayTR iframe vb.) eklenmeli.
- Sipariş takip sayfası (`/orders/[uuid]`) henüz yok.
- Header/Navbar, arama, kategori filtreleme UI'ı henüz yok.

## Sırada Ne Var?

1. `GET /api/v1/products` + `GET /api/v1/products/{slug}` controller'larını yazmak
   (bu, frontend'in gerçekten çalışması için gerekli eksik parça)
2. Sipariş takip / teslimat sayfası (`/orders/[uuid]`) — teslim edilen
   kod/lisansın maskelenmiş gösterimi (madde 9: hassas alanlar maskeli)
3. Header + arama + kategori filtreleme
