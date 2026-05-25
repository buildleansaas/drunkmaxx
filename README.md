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
- Fixture-first app flow; real data/auth/maps come in later slices

## Commands

```bash
pnpm install
pnpm run verify
pnpm run web
pnpm run export:web
```

See `docs/product-brief.md` for the full product thesis and flow constraints.
