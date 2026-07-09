# pisti.game

Next.js (App Router) + TypeScript + Tailwind + Framer Motion tabanlı, botlara karşı oynanan web Pişti oyunu.

## Özellikler

- Client-side `GameEngine` ile Pişti kuralları (toplama, vale, pişti, puanlama)
- Başlangıç / Orta / Usta bot davranışları (her elde en az 2 kolay bot)
- Cyber-Classic tema, fan-view el dizilimi, PİŞTİ animasyonu, ripple efekti
- Alt sabit navigasyon + üst kullanıcı paneli
- Mağaza (15 RGB çerçeve), dinamik fiyatlandırma
- Görevler, profil, leaderboard, canlı akış
- `/admin` paneli (admin/admin58), kullanıcı listeleme, coin tanımlama, reset tetikleme
- Supabase normalize şema: `user_roles`, `user_inventory`, `audit_log`

## Çalıştırma

```bash
npm install
npm run dev
```

## Ortam Değişkenleri

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

> Resend API key’i kod içine gömmeyin; sadece `RESEND_API_KEY` env değişkeninde kullanın.

## Supabase

- Şemayı uygulamak için: `/supabase/schema.sql`

## Build

```bash
npm run lint
npm run build
```
