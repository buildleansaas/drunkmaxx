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
  'Refreshing drink intel',
  'Checking tonight’s drink intel',
  'Using cached picks while we check for updates.',
  'Best known deal',
  'Allow location access',
  'Use this ZIP to find bars',
  'Enter a ZIP first',
  'Showing cached picks for',
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
  'DancingDrinksLoader',
  'RankedBarCard',
  'LocationPermissionPanel',
];
for (const component of requiredComponents) {
  assert(app.includes(component), `app/index.tsx defines/uses component: ${component}`);
}

assert(app.includes('north-star-screen'), 'screen has north-star-screen testID');
assert(app.includes('beer') && app.includes('martini') && app.includes('wine') && app.includes('cocktail'), 'screen includes four GPT-image drink sticker variants');
assert(app.includes('assets/drinks/beer.png') && app.includes('assets/drinks/martini.png') && app.includes('assets/drinks/wine.png') && app.includes('assets/drinks/cocktail.png'), 'drink stickers use generated PNG app assets');
assert(!app.includes('🍺') && !app.includes('🍸') && !app.includes('🍷') && !app.includes('🍹'), 'drink stickers are generated PNGs, not emoji stand-ins');
assert(!app.includes('lockBubble') && !app.includes('lockText') && !app.includes('▢'), 'trust line has no fake checkbox/lock decoration');
assert(app.includes('#FAF8F2') || app.includes('#fbf8f1'), 'uses warm off-white background token');
assert(app.includes('#F6B329') || app.includes('#f6b329'), 'uses amber CTA token');
assert(app.includes('fontFamily'), 'uses explicit typography styling for theme');

assert(app.includes('navigator.geolocation.getCurrentPosition'), 'Use my location requests browser geolocation before results');
assert(app.includes('setLookupError'), 'ZIP path validates missing ZIP before lookup');
assert(app.includes('zipValue.trim()'), 'Find bars uses the typed ZIP value for lookup context');
assert(!app.includes("onSearch={() => setScreen('results')}"), 'location button must not jump directly to random fixture results');
assert(app.includes('Showing cached picks for') && app.includes('lookupLabel'), 'results explain the current cached lookup context');

if (process.exitCode) process.exit(1);
console.log('North-star Expo screen contract passed.');
