# Pişti Online Oyun Platformu

Türkiye'nin en sevilen kart oyununun modern, profesyonel online platformu. Bot'larla gerçek Pişti oynayın, mağazadan çerçeve/masa alın, liderlik tablosunda yükselin.

## Run & Operate

- `pnpm --filter @workspace/pisti-game run dev` — Geliştirme sunucusu (port değişken)
- `pnpm --filter @workspace/pisti-game run build` — Vercel için production build (`artifacts/pisti-game/dist/`)
- `pnpm --filter @workspace/pisti-game run typecheck` — TypeScript doğrulama

## Stack

- React 18 + Vite + TypeScript
- Firebase Auth + Firestore (backend yok — tamamen istemci taraflı)
- GSAP (animasyon)
- Tailwind CSS + shadcn/ui
- Wouter (SPA routing)
- pnpm workspaces monorepo

## Firebase Konfigürasyonu

- Project ID: `pistigame-2542a`
- Auth Domain: `pistigame-2542a.firebaseapp.com`
- Config dosyası: `artifacts/pisti-game/src/lib/firebase.ts`
- **Storage kullanılmıyor** — görseller Base64 olarak Firestore'da saklanıyor

## Admin Hesabı

- E-posta: `ercanulger@pistigame.com`
- Şifre: `admin58`
- Firebase Auth'da bu hesabı oluşturup giriş yaptığında Firestore'da otomatik `isAdmin: true` atanır
- Profilde mavi tik ✓ + "Admin" etiketi gösterilir

## Vercel Deploy (GitHub → Vercel)

1. Projeyi GitHub'a push et
2. Vercel'de "New Project" → GitHub repo seç
3. **Build Command:** `pnpm --filter @workspace/pisti-game run build`
4. **Output Directory:** `artifacts/pisti-game/dist`
5. **Install Command:** `pnpm install`
6. Root'taki `vercel.json` SPA routing'i otomatik ayarlar

## Firestore Güvenlik Kuralları (Deploy öncesi ayarla)

Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /gameHistory/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## Proje Yapısı

```
artifacts/pisti-game/
├── src/
│   ├── lib/
│   │   ├── firebase.ts      — Firebase bağlantısı
│   │   ├── firestore.ts     — Firestore CRUD helpers
│   │   └── gameEngine.ts    — Pişti oyun motoru (tam kurallar)
│   ├── contexts/
│   │   ├── AuthContext.tsx  — Firebase auth state
│   │   └── GameContext.tsx
│   ├── pages/               — Tüm sayfalar
│   └── components/          — Oyun, mağaza, layout bileşenleri
├── vercel.json              — SPA routing + build config
└── dist/                    — Build çıktısı (Vercel hedefi)
```

## Oyun Kuralları (Pişti)

- Karo 10 (♦10) = 3 puan
- Sinek 2 (♣2) = 2 puan  
- Her As = 1 puan
- Her J = 1 puan
- En fazla kart toplayan = +3 puan
- Pişti (masada 1 kart, eşleştirme) = +10 puan
- J ile toplama PİŞTİ SAYILMAZ

## Ekonomi

- Başlangıç coin: 500
- Galibiyet: +50 coin, +3 kupa
- Mağlubiyet: +10 coin
- Her pişti: +5 bonus coin

## User preferences

- Uygulama tamamen Türkçe
- Firebase backend, Replit veritabanı kullanılmıyor
- GitHub → Vercel deployment (Replit deploy yok)
- Görseller için Base64, Firebase Storage yok

## Pointers

- Oyun motoru: `artifacts/pisti-game/src/lib/gameEngine.ts`
- Firestore helpers: `artifacts/pisti-game/src/lib/firestore.ts`
- Auth akışı: `artifacts/pisti-game/src/contexts/AuthContext.tsx`
