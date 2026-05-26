# DrunkMaxx

Expo-first mobile web/app prototype for finding tonight’s best bar by **buzz-per-dollar**.

## North-star slice

The current implementation starts with the approved simple sticker-style screen:

- `ARE YOU DRUNKMAXXING?`
- `Let’s Get Drunk`
- Location permission CTA
- ZIP search fallback
- Low-ink drink sticker icon language
- Expo Web now, iOS/Android later

## Tech

- Expo Router
- React Native + React Native Web
- TypeScript
- Fixture-first app flow while the real data worker is added in slices
- Vercel Serverless Functions for Mongo-backed scrape jobs

## Scrape job API

This slice adds the first real backend seam:

- `POST /api/scrape-jobs` creates a queued Mongo job and returns `{ jobId, job }`.
- `GET /api/scrape-jobs/:jobId` returns the current job status/results.
- Collection: `drunkmaxx_scrape_jobs`.
- Statuses: `queued`, `running`, `complete`, `failed`, `stale`.

Required Vercel env:

```bash
MONGO_URI=mongodb+srv://...
# Optional; defaults to drunkmaxx
MONGO_DB_NAME=drunkmaxx
```

The worker is intentionally not part of this slice. The next slice should claim `queued` jobs atomically and write marked worker output.

## Commands

```bash
pnpm install
pnpm run verify
pnpm run web
pnpm run export:web
```

See `docs/product-brief.md` for the full product thesis and flow constraints.
