import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const pkg = JSON.parse(read('package.json'));
assert(pkg.dependencies?.expo, 'package.json includes Expo');
assert(pkg.dependencies?.['expo-router'], 'package.json includes expo-router');
assert(pkg.dependencies?.['react-native'], 'package.json includes react-native');
assert(pkg.dependencies?.['react-native-web'], 'package.json includes react-native-web');
assert(pkg.scripts?.web?.includes('expo'), 'package.json has Expo web script');
assert(pkg.scripts?.verify?.includes('verify-north-star-expo'), 'package.json verify script runs north-star contract');

const app = read('app/index.tsx');
const requiredCopy = [
  'ARE YOU DRUNKMAXXING?',
  "Let’s Get Drunk",
  'Find tonight’s best bar',
  'buzz-per-dollar',
  'Use my location',
  'Enter ZIP code',
  'Find bars',
  'We use this once to rank nearby drink value.',
  'Tonight’s cheapest buzz',
  'Cached demo picks',
  'Showing cached demo data while the real scout worker is being built.',
  'Demo scout preview',
  'Real bar/deal scraping is not connected yet.',
  'Text me',
  'Best known deal',
  'Allow location access',
  'Use this ZIP to find bars',
  'Enter a ZIP first',
  'Showing cached demo picks for',
  'Default filter: within 30 minutes',
];
for (const copy of requiredCopy) {
  assert(app.includes(copy), `app/index.tsx contains copy: ${copy}`);
}

const requiredComponents = [
  'StickerBadge',
  'DrinkSticker',
  'LocationButton',
  'ZipSearch',
  'TrustLine',
  'ResultsScreen',
  'RefreshingStatusStrip',
  'ScrapeSignupLoader',
  'RankedBarCard',
  'LocationPermissionPanel',
  'EmptyResultsScreen',
];
for (const component of requiredComponents) {
  assert(app.includes(component), `app/index.tsx defines/uses component: ${component}`);
}

assert(app.includes('north-star-screen'), 'screen has north-star-screen testID');
assert(app.includes('beer') && app.includes('martini') && app.includes('wine') && app.includes('cocktail'), 'screen includes four GPT-image drink sticker variants');
assert(app.includes('assets/drinks/beer.png') && app.includes('assets/drinks/martini.png') && app.includes('assets/drinks/wine.png') && app.includes('assets/drinks/cocktail.png'), 'drink stickers use generated PNG app assets');
assert(app.includes('assets/loading/sleeping-drinks.png'), 'no-cache loading state uses generated sleeping drink mascot image');
assert(fs.existsSync(path.join(root, 'assets/loading/sleeping-drinks.png')), 'generated sleeping drink mascot asset exists');
assert(!app.includes('🍺') && !app.includes('🍸') && !app.includes('🍷') && !app.includes('🍹'), 'drink stickers are generated PNGs, not emoji stand-ins');
assert(!app.includes('lockBubble') && !app.includes('lockText') && !app.includes('▢'), 'trust line has no fake checkbox/lock decoration');
assert(app.includes('#FAF8F2') || app.includes('#fbf8f1'), 'uses warm off-white background token');
assert(app.includes('#F6B329') || app.includes('#f6b329'), 'uses amber CTA token');
assert(app.includes('fontFamily'), 'uses explicit typography styling for theme');

assert(app.includes('navigator.geolocation.getCurrentPosition'), 'Use my location requests browser geolocation before results');
assert(app.includes('setLookupError'), 'ZIP path validates missing ZIP before lookup');
assert(app.includes('zipValue.trim()'), 'Find bars uses the typed ZIP value for lookup context');
assert(!app.includes("onSearch={() => setScreen('results')}"), 'location button must not jump directly to random fixture results');
assert(app.includes('Showing cached demo picks for') && app.includes('lookupLabel'), 'results explain the current cached lookup context');

assert(app.includes('reverseGeocodeZip'), 'GPS lookup reverse geocodes coordinates into a ZIP before loading results');
assert(app.includes('api.bigdatacloud.net/data/reverse-geocode-client') || app.includes('nominatim.openstreetmap.org/reverse'), 'reverse geocoding uses a free no-key API');
assert(app.includes('filterResultsForLookup'), 'cached results are filtered by active ZIP/context');
assert(app.includes('maxDriveMinutes') && app.includes('30'), 'results enforce default 30-minute drive filter');
assert(!app.includes("lookupLabel: `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`"), 'GPS results should not label by raw coordinates');
assert(app.includes('phoneValue') && app.includes('textContentType="telephoneNumber"'), 'no-cache refresh state includes phone capture CTA');
assert(pkg.dependencies?.['@clerk/clerk-expo'], 'package.json includes Clerk Expo for phone verification');
assert(pkg.dependencies?.['@react-native-async-storage/async-storage'], 'package.json includes AsyncStorage for persisted app state');
assert(pkg.dependencies?.mongodb, 'package.json includes MongoDB driver for real scrape job API');
assert(app.includes('useSignUp') && app.includes('preparePhoneNumberVerification') && app.includes('attemptPhoneNumberVerification'), 'phone capture uses Clerk phone code verification flow');
assert(app.includes('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'), 'Clerk publishable key env is wired with safe fallback');
assert(app.includes('DRUNKMAXX_APP_STATE') && app.includes('persistAppState') && app.includes('loadPersistedAppState'), 'ZIP/phone/lookup state persists across refreshes');
assert(app.includes('verificationCode') && app.includes('Text code') && app.includes('Verify code'), 'UI redirects phone entry into text code verification input');
assert(app.includes("setScreen('results')") && app.includes('restoredLookup'), 'saved ZIP/lookup automatically reopens results page on reload');

// Scrape job simulation assertions
assert(app.includes('generateSimulatedBars'), 'no-cache ZIP generates simulated bars via deterministic function');
assert(app.includes('ScrapeProgressPanel'), 'scrape progress panel component exists');
assert(app.includes('SCRAPE_STEP_LABELS'), 'scrape step labels defined');
assert(app.includes('queued') && app.includes('scouting') && app.includes('analyzing') && app.includes('ranking'), 'scrape job has all 4 non-terminal step states');
assert(app.includes('Preparing demo preview'), 'scrape progress honestly labels queued demo state');
assert(app.includes('Generating placeholder bars'), 'scrape progress honestly labels placeholder generation');
assert(app.includes('Sorting demo cards'), 'scrape progress honestly labels demo ranking');
assert(app.includes('scrapeJob: scrapeJob ?? undefined'), 'scrape job is persisted in AsyncStorage app state');
assert(app.includes('setScrapeJob'), 'scrape job state is managed with setter function');
assert(app.includes('ScoutTask') || app.includes('generateSimulatedBars'), 'no-cache path generates candidate bar results for ZIP');
assert(app.includes('Generated demo preview'), 'placeholder bar results use honest demo freshness label');
assert(app.includes('scrapeResultsList'), 'completed scrape renders bar cards list');

const forbiddenLiveScrapeCopy = [
  'Scouted fresh intel',
  'Scouted just now',
  'DATA SCRAPE RUNNING',
  'Scouting Google Maps',
  'Analyzing drink menus',
  'we’ll text you when we’ve got tonight’s best plans',
];
for (const copy of forbiddenLiveScrapeCopy) {
  assert(!app.includes(copy), `app/index.tsx must not imply real scrape is live: ${copy}`);
}

assert(app.includes('useColorScheme'), 'theme reads system color scheme');
assert(app.includes('DRUNKMAXX_THEME_MODE'), 'theme preference persists separately from app state');
assert(app.includes("ThemePreference = 'system' | 'light' | 'dark'"), 'theme supports system/light/dark preference');
assert(app.includes('Appearance.addChangeListener'), 'theme responds to system dark/light changes');
assert(app.includes('ThemeToggle'), 'UI includes a sun/moon theme toggle');
assert(app.includes('toggleThemePreference'), 'theme toggle cycles user preference');
assert(app.includes('darkTokens'), 'dark palette tokens are defined');

// Real Mongo-backed scrape job API assertions
const scrapeApi = read('api/scrape-jobs.mjs');
const scrapePollApi = read('api/scrape-jobs/[jobId].mjs');
const scrapeJobs = read('lib/scrapeJobs.mjs');
const mongo = read('lib/mongo.mjs');
assert(scrapeApi.includes('createScrapeJob') && scrapeApi.includes('202'), 'POST /api/scrape-jobs creates queued Mongo job');
assert(scrapePollApi.includes('getScrapeJob') && scrapePollApi.includes('jobId'), 'GET /api/scrape-jobs/:jobId polls a Mongo job');
assert(mongo.includes('MONGO_URI') && mongo.includes('MongoClient'), 'Mongo helper uses MONGO_URI without hardcoded credentials');
assert(scrapeJobs.includes('drunkmaxx_scrape_jobs'), 'scrape jobs use drunkmaxx_scrape_jobs collection');
assert(scrapeJobs.includes('queued') && scrapeJobs.includes('running') && scrapeJobs.includes('complete') && scrapeJobs.includes('failed') && scrapeJobs.includes('stale'), 'scrape job statuses are defined');
assert(scrapeJobs.includes('createIndex({ status: 1, createdAt: 1 })'), 'scrape job queue index exists');
assert(scrapeJobs.includes('buildSearchTerms') && scrapeJobs.includes('brewery') && scrapeJobs.includes('winery') && scrapeJobs.includes('happy hour'), 'queued jobs store alcohol search terms');
assert(scrapeJobs.includes('claimQueuedScrapeJob') && scrapeJobs.includes('findOneAndUpdate') && scrapeJobs.includes('returnDocument'), 'worker can atomically claim queued scrape jobs');
assert(scrapeJobs.includes('completeScrapeJob') && scrapeJobs.includes('workerMetadata') && scrapeJobs.includes('failScrapeJob'), 'worker can complete or fail claimed jobs with marked output');
const scrapeWorker = read('scripts/scrape-worker.mjs');
assert(pkg.scripts?.['worker:once']?.includes('scrape-worker.mjs --once'), 'package.json exposes worker:once scaffold command');
assert(pkg.scripts?.['verify:source-adapter']?.includes('verify-source-adapter.mjs'), 'package.json exposes source adapter contract');
assert(scrapeWorker.includes('--once') && scrapeWorker.includes('claimQueuedScrapeJob') && scrapeWorker.includes('completeScrapeJob'), 'worker scaffold supports one-shot claim/writeback mode');
assert(scrapeWorker.includes('buildSourceAdapterResults') && scrapeWorker.includes('adapter_v1') && scrapeWorker.includes('liveScrape: false'), 'worker writes marked non-live source adapter output');
const sourceAdapter = read('lib/sourceAdapter.mjs');
assert(sourceAdapter.includes('normalizeCandidateFromEvidence') && sourceAdapter.includes('buildSourceAdapterResults'), 'source adapter normalizes evidence-linked candidates');
assert(sourceAdapter.includes('venue_deal_candidate') && sourceAdapter.includes('verifiedLiveDeal: false'), 'source adapter candidate schema avoids live deal claims');
assert(sourceAdapter.includes('Source adapter candidate only; no SMS/outreach sent.'), 'source adapter output includes no-send warning');

if (process.exitCode) process.exit(1);
console.log('North-star Expo screen contract passed.');
