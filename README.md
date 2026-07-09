# Pişti Masters

Tailwind + GSAP + Firebase (Auth + Firestore) tabanlı SPA Pişti platformu.

## Geliştirme

```bash
pnpm install
pnpm --filter @workspace/pisti-game run dev
```

## Build (Vercel uyumlu)

```bash
pnpm --filter @workspace/pisti-game run build
```

`vercel.json` zaten SPA rewrite ile yapılandırılmıştır.

## Firebase

- Client config: `/home/runner/work/pisti/pisti/artifacts/pisti-game/src/lib/firebase.ts`
- Firestore Rules: `/home/runner/work/pisti/pisti/firestore.rules`

Rules yüklemek için:

```bash
firebase deploy --only firestore:rules
```

## Admin

- Kullanıcı adı: `ercanulger`
- Şifre: `admin58`
- İlk girişte admin hesabı (`ercanulger@pistigame.com`) otomatik oluşturulur.
