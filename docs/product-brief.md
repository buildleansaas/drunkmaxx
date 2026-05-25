# DrunkMaxx Product Brief

**One-liner:** DrunkMaxx is a mobile-first PWA that helps groups instantly decide "where should we go get drunk tonight?" by ranking real venues on a "DrunkMax Score" — how much intoxication you can achieve for your budget and chosen vibe by analyzing drink menus for price-per-ABV efficiency.

**Target audience:** 21-35yo social drinkers, party groups, bachelor/ette parties, digital nomads looking for local "levels" equivalents for nightlife (inspired by Levels.io nomad list but for getting smashed). Fun, provocative but not explicit — "drunk maxing with two X's".

**Product thesis:** Most "best bars" lists are subjective or price-blind. DrunkMaxx makes it objective and budget-aware: match vibe + $budget → highest proof/dollar spot with calculated "you'll be at level 8 smashed after 3 rounds here". Turns "yo where we going?" into data-driven fun with shareable results.

**Core pillars (must preserve):**
- **Drunk Maxing mechanic:** Main filter/hero feature. Input budget + vibe → calculates max intoxication level based on estimated menu pricing (beer ABV/price, liquor proof/price, cocktails). "With $50 in [Vibe], you can hit X shots of 40% liquor or Y beers at this spot."
- **Vibe filters:** Chill dive, high-energy club, classy cocktail lounge, sports bar, social/hookup-adjacent mixer (social only, no sex/porn direction), romantic, foodie bar, etc. Provocative but clean branding.
- **Provocative name/branding:** DrunkMaxx (double X emphasis), taglines like "Drunk Maxx the Drunk Maxxing", "Maxx Your Buzz", "Axxx Drunk". Edgy, fun, meme-able without crossing into explicit/sex content.
- **PWA first:** Installable on phone for night-out use. Next.js, mobile responsive, snappy, dark/neon theme.
- **Simple & social:** "I know how to DrunkMaxx" shareable cards, group voting on vibes, list of top spots per city.
- **Data-driven scores:** MVP uses fixture/demo menus (Austin + Richmond data). Prioritize Google Business/Maps scraper for real bars/menus in target cities (start Richmond). 

**Offline discovery loop (must preserve):** Minimal B&W QR stickers at top-ranked bars ("Are you DrunkMaxxing?"). Black/white only base (white bg/black text or black bg/white text), very crisp/minimal font. Vibrant accent color per bar/theme tied to alcohol (beer amber/gold, wine red, tequila green, pineapple-coconut teal, etc.). Theme sticker to each bar's aesthetic. 

**Bare-minimum happy user path (pre-deployment priority, updated 2026-05-25):**
- Entry screen title/CTA language: “Let’s Get Drunk”.
- On load, user must either allow location services or search a ZIP code.
- MVP default ranking formula: cheapest alcohol per dollar only. Show both simple label + math, e.g. “Best buzz value — $5.43 per oz alcohol.”
- After location/ZIP, automatically show the prefiltered list of cheapest drinks per alcoholic volume nearby.
- Use Richmond / ZIP `23220` as the canonical mock/demo path.
- Copy tone: playful but useful — “Maxx your buzz without maxxing your tab” style.
- All filters/knobs/buttons are visible but locked while logged out. Tapping any filter triggers Clerk login/signup flow to save/customize the DrunkMaxx profile.
- Logged-out users can see venue list, venue detail, menu/photos/basic info and map/ride actions; deeper filtering/comparison/customization requires login.
- Venue actions: Google Maps and Apple Maps app deep links should pass destination when possible. Uber/Lyft/request ride appears as a single logo/action button; if real destination deep-link is not feasible yet, show “Request ride” placeholder and trigger the same paid/login mode popup.
- QR sticker tracking/customization is a future loop: eventually each printed sticker should have a unique QR/source/bar code for attribution, but first app mock should start generic (location/ZIP gate) rather than bar-specific.
- Clerk passwordless auth via email or SMS one-time code; user copies/pastes OTP into the app.
- Post-login: full filter access is the first unlocked experience.
This keeps core scan→nearby discovery low-friction while gating personalization/sharing behind easy auth.

**Brand/design direction (updated from 2026-05-24 voice note; must preserve):** Do **not** lock DrunkMaxx to the previously prescribed strict black/white night theme. Erase the old theme mandate and rethink the entire brand strategy from first principles. Keep what worked: simple, small square QR-sticker format and the fun drink-character/icon energy from the latest iteration. The brand should feel like the best possible 4K bar-sticker/app identity for a provocative nightlife utility: instantly recognizable from a distance, playful enough for bathrooms/bar walls, credible enough to make someone scan, and extensible into the whole app UI. Prioritize bold composition, memorable mascot/icon language, strong contrast, and restrained but distinctive color. shadcn/ui can still be used for implementation polish, but the visual system should come from the new brand exploration rather than a black/white-only constraint.

**Image assets (minimum frames, generate one-at-a-time high-quality Codex/GPT-Image-2, pristine high-res rasters):** 
1. Primary QR sticker production constraint (corrected/approved 2026-05-25): 2 inch x 2 inch square printable, low ink cost, cheap to print in volume, scannable from a bar table/wall, minimal enough to create curiosity. Avoid full-bleed dark backgrounds, heavy illustration, or expensive ink coverage. Use mostly white/negative space and black QR. Top text stays: “ARE YOU DRUNKMAXXING?” Bottom text: “Scan to find tonight’s best bar”. Remove DrunkMaxx wordmark from bottom. Add drink-character icons only on the left/right sides of the QR code (not above/below), so the QR can be larger; preserve QR quiet zone and scan/readability. Production QR must be generated/replaced with a real scannable code.
2. Hero/landing illustration can borrow approved personality later, but do not confuse it with the low-cost physical sticker spec.
3. Key UI elements derived from the approved brand system (vibe cards, results screen accents, location prompt visual if needed).
Approve each before next. No fake app chrome or baked UI in clean rasters unless explicitly requested for a mockup.

**Bar partnerships/promotions (must preserve):** Outreach to top-ranked bars: "You're #1 for [vibe] in Richmond — want a featured promo spot in the app?" In exchange for sticker placement. Sticker drives app opens, ratings (Yelp + in-app), recurring visits. Provide custom promo math ("Bring 4 friends for $150 on Saturday — enjoy your [vibe] with this event"). Aligns with any bar goal (visits, reviews, events).

**Must-preserve from both voice notes:**
- Pure focus on efficient/vibey drunk-maxing (no sex/porn direction; optional social "meet people" filter only).
- Provocative "DrunkMaxx / drunk maxing with two X's" naming and social hook ("I know how to DrunkMaxx").
- Tight MVP: PWA calculator + leaderboard + fixtures first. These sticker/partnership/scraper elements are core to the flywheel — capture in docs but implement post-prototype (v0.5).
- Start Richmond-focused for data + initial bar outreach.

**MVP Success metric:** Deployed PWA where users can maxx a budget/vibe, see results, and understand the sticker/partnership vision from the "For Bars" section. Gets excitement for full build.

**v0.5 / near-term (do not bloat prototype):**
- Richmond scraper (Google Business/Maps).
- Sticker generator/mockups (B&W minimal + themed accents).
- "For Bars" page with outreach script, promo math examples, QR designs.
- Partnership dashboard for featured promos.

**Post-MVP:**
- Full scraping pipeline, user submissions, city nomad lists, group sessions, gamification, monetization (featured bar slots, premium city guides).
