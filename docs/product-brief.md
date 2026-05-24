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
- **Data-driven scores:** For MVP use fixture/demo menus for 10-20 venues per city. Later real menu scraping/API.

**Must-preserve from voice note:**
- Focus is purely on getting drunk efficiently and vibing — "literally just for going out and getting drunk".
- Price + vibe + menu pricing analysis for "highest level of intoxication".
- No sex/hookup as core (optional "meet people" social filter only).
- Start with single Next.js PWA to spike/validate the idea before full app build.
- Fun, provocative naming around "drunk maxing" with XX.

**Post-MVP ideas (do not build yet):**
- Real-time menu scraping / Google Maps / Yelp integration
- User-submitted menus/photos
- City nomad lists (like Levels.io)
- Group session with live voting
- AR filters or gamification for levels of drunk
- Monetization (premium scores, ad-free, city guides)

**Success metric for first PWA:** Deployed live Vercel URL where someone can play with the drunk max calculator, see fake venue rankings, install as PWA, and get excited enough to say "build the real one".
