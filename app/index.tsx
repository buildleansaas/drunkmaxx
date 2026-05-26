import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignUp } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import {
  Appearance,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';
type ThemeTokens = {
  paper: string;
  ink: string;
  muted: string;
  softLine: string;
  amber: string;
  amberDark: string;
  lime: string;
  red: string;
  white: string;
  card: string;
  input: string;
  overlay: string;
  shadow: string;
};

const lightTokens: ThemeTokens = {
  paper: '#FAF8F2',
  ink: '#111111',
  muted: '#5F5F5F',
  softLine: '#E6DDD1',
  amber: '#F6B329',
  amberDark: '#D79611',
  lime: '#9BAE12',
  red: '#B3263B',
  white: '#FFFDF8',
  card: '#FFFDF8',
  input: '#FFFDF8',
  overlay: 'rgba(255, 253, 248, 0.92)',
  shadow: '#111111',
};

const darkTokens: ThemeTokens = {
  paper: '#15110C',
  ink: '#FFF7E8',
  muted: '#C9BDA9',
  softLine: '#3E3326',
  amber: '#F6B329',
  amberDark: '#FFCF67',
  lime: '#D1E35D',
  red: '#FF6B7D',
  white: '#241B13',
  card: '#211910',
  input: '#2A2117',
  overlay: 'rgba(33, 25, 16, 0.94)',
  shadow: '#000000',
};

let tokens = lightTokens;

const HERO_TITLE = 'Let’s Get Drunk';

type DrinkStickerProps = {
  type: 'beer' | 'martini' | 'wine' | 'cocktail';
  style?: object;
};

type BarResult = {
  rank: number;
  name: string;
  deal: string;
  economics: string;
  score: number;
  distance: string;
  freshness: string;
  zip: string;
  driveMinutes: number;
};

type LookupContext = {
  kind: 'gps' | 'zip';
  zip: string;
  lookupLabel: string;
  maxDriveMinutes: number;
};

type LocationStatus = 'idle' | 'requesting' | 'error';
type VerificationStep = 'phone' | 'code' | 'verified';
type ScrapeStep = 'queued' | 'scouting' | 'analyzing' | 'ranking' | 'complete';

type ScrapeJob = {
  step: ScrapeStep;
  bars: BarResult[];
  startedAt: number;
  zip: string;
};

type PersistedAppState = {
  zipValue: string;
  phoneValue: string;
  lookup?: LookupContext;
  screen?: 'location' | 'results';
  scrapeJob?: ScrapeJob;
};

const DRUNKMAXX_APP_STATE = 'DRUNKMAXX_APP_STATE';
const DRUNKMAXX_THEME_MODE = 'DRUNKMAXX_THEME_MODE';
const isClerkPhoneEnabled = Boolean(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

const resolveThemePreference = (preference: ThemePreference, systemScheme: 'light' | 'dark' | null | undefined): ResolvedTheme => {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemScheme === 'dark' ? 'dark' : 'light';
};

const loadThemePreference = async (): Promise<ThemePreference> => {
  try {
    const storedPreference = await AsyncStorage.getItem(DRUNKMAXX_THEME_MODE);
    return storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system' ? storedPreference : 'system';
  } catch {
    return 'system';
  }
};

const persistThemePreference = async (preference: ThemePreference) => {
  try {
    await AsyncStorage.setItem(DRUNKMAXX_THEME_MODE, preference);
  } catch {
    // Theme persistence is best-effort; system mode still works.
  }
};

const persistAppState = async (state: PersistedAppState) => {
  try {
    await AsyncStorage.setItem(DRUNKMAXX_APP_STATE, JSON.stringify(state));
  } catch {
    // Persistence is best-effort; auth/location flow should still work.
  }
};

const loadPersistedAppState = async (): Promise<PersistedAppState | undefined> => {
  try {
    const rawState = await AsyncStorage.getItem(DRUNKMAXX_APP_STATE);
    return rawState ? JSON.parse(rawState) : undefined;
  } catch {
    return undefined;
  }
};

const drinkAssets: Record<DrinkStickerProps['type'], ImageSourcePropType> = {
  beer: require('../assets/drinks/beer.png'),
  martini: require('../assets/drinks/martini.png'),
  wine: require('../assets/drinks/wine.png'),
  cocktail: require('../assets/drinks/cocktail.png'),
};

const sleepingDrinksAsset = require('../assets/loading/sleeping-drinks.png');

const reverseGeocodeZip = async (latitude: number, longitude: number) => {
  const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Reverse geocode failed');
  }

  const data = await response.json();
  const zip = data.postcode || data.postalCode || data.principalSubdivisionCode;

  if (!zip) {
    throw new Error('No ZIP found for location');
  }

  return String(zip).slice(0, 5);
};

const filterResultsForLookup = (results: BarResult[], lookup: LookupContext) =>
  results.filter((result) => result.zip === lookup.zip && result.driveMinutes <= lookup.maxDriveMinutes);

const cachedResults: BarResult[] = [
  {
    rank: 1,
    name: 'Cobra Cabana',
    deal: '$3.50 High Life',
    economics: '12oz · 4.6% · $3.50',
    score: 94,
    distance: '0.7 mi',
    freshness: 'Updated 3h ago',
    zip: '23220',
    driveMinutes: 8,
  },
  {
    rank: 2,
    name: 'Bamboo Cafe',
    deal: '$4 rail whiskey',
    economics: '1.5oz · 40% · $4',
    score: 89,
    distance: '1.1 mi',
    freshness: 'Updated today',
    zip: '23220',
    driveMinutes: 12,
  },
  {
    rank: 3,
    name: 'GWARbar',
    deal: '$5 draft special',
    economics: '16oz · 5.2% · $5',
    score: 82,
    distance: '1.4 mi',
    freshness: 'Refreshing',
    zip: '23220',
    driveMinutes: 18,
  },
];

const BAR_NAME_POOLS = [
  ['The Rusty Nail', 'The Tipsy Goat', 'Last Call Lounge'],
  ['The Drunk Tank', 'Barley & Hops', 'The Salty Siren'],
  ['The Alibi Room', 'The Copper Mug', 'The Drunken Duck'],
  ['The Lucky Horseshoe', 'The Stagger Inn', 'The Buzzed Bee'],
  ['The Pour House', 'The Thirsty Scholar', 'The Wobbly Wheel'],
];

const DEAL_POOL = [
  { deal: '$3.50 High Life', economics: '12oz · 4.6% · $3.50', score: 94 },
  { deal: '$4 rail whiskey', economics: '1.5oz · 40% · $4', score: 89 },
  { deal: '$5 draft special', economics: '16oz · 5.2% · $5', score: 82 },
  { deal: '$2 PBR tallboy', economics: '16oz · 4.8% · $2', score: 97 },
  { deal: '$6 craft pint', economics: '16oz · 6.8% · $6', score: 78 },
  { deal: '$3.50 well shot', economics: '1.5oz · 40% · $3.50', score: 88 },
];

const generateSimulatedBars = (zip: string): BarResult[] => {
  const seed = parseInt(zip, 10) || 23220;
  const namePool = BAR_NAME_POOLS[seed % BAR_NAME_POOLS.length];
  const distBase = (seed % 12) * 0.3 + 0.5;

  return namePool.map((name, i) => {
    const deal = DEAL_POOL[(seed + i * 7) % DEAL_POOL.length];
    return {
      rank: i + 1,
      name,
      deal: deal.deal,
      economics: deal.economics,
      score: deal.score,
      distance: `${(distBase + i * 0.3).toFixed(1)} mi`,
      freshness: 'Generated demo preview',
      zip,
      driveMinutes: Math.round(distBase * 8 + i * 4 + 3),
    };
  });
};

function StickerBadge() {
  return (
    <View style={styles.badgeWrap}>
      <Spark side="left" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>ARE YOU DRUNKMAXXING?</Text>
      </View>
      <Spark side="right" />
    </View>
  );
}

function Spark({ side }: { side: 'left' | 'right' }) {
  return (
    <View style={[styles.spark, side === 'left' ? styles.sparkLeft : styles.sparkRight]}>
      <View style={styles.sparkLine} />
      <View style={[styles.sparkLine, styles.sparkLineMiddle]} />
      <View style={styles.sparkLine} />
    </View>
  );
}

function ThemeToggle({ preference, resolvedTheme, onToggle }: { preference: ThemePreference; resolvedTheme: ResolvedTheme; onToggle: () => void }) {
  const icon = resolvedTheme === 'dark' ? '☾' : '☀';
  const label = preference === 'system' ? `System ${resolvedTheme}` : `${preference} mode`;

  return (
    <Pressable style={styles.themeToggle} onPress={onToggle} accessibilityRole="button" accessibilityLabel="Toggle dark and light mode">
      <Text style={styles.themeToggleIcon}>{icon}</Text>
      <Text style={styles.themeToggleText}>{label}</Text>
    </Pressable>
  );
}

function DrinkSticker({ type, style }: DrinkStickerProps) {
  return (
    <Image
      source={drinkAssets[type]}
      style={[styles.drinkSticker, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

function LocationPin() {
  return (
    <View style={styles.locationPin}>
      <View style={styles.locationPinHole} />
    </View>
  );
}

function LocationButton({ onSearch, status }: { onSearch: () => void; status: LocationStatus }) {
  return (
    <Pressable style={styles.locationButton} accessibilityRole="button" onPress={onSearch} disabled={status === 'requesting'}>
      <LocationPin />
      <Text style={styles.locationButtonText}>{status === 'requesting' ? 'Allow location access' : 'Use my location'}</Text>
    </Pressable>
  );
}

function ZipSearch({ zipValue, onZipChange, onSearch }: { zipValue: string; onZipChange: (value: string) => void; onSearch: () => void }) {
  return (
    <View style={styles.zipRow}>
      <View style={styles.zipInputWrap}>
        <Text style={styles.zipIcon}>⌖</Text>
        <TextInput
          placeholder="Enter ZIP code"
          placeholderTextColor="#9B9B9B"
          keyboardType="number-pad"
          style={styles.zipInput}
          value={zipValue}
          onChangeText={onZipChange}
          onSubmitEditing={onSearch}
        />
      </View>
      <Pressable style={styles.findButton} accessibilityRole="button" onPress={onSearch}>
        <Text style={styles.findButtonText}>Find bars</Text>
      </Pressable>
    </View>
  );
}

function LocationPermissionPanel({ status, error }: { status: LocationStatus; error?: string }) {
  if (status === 'idle' && !error) return null;

  return (
    <View style={styles.permissionPanel}>
      <Text style={styles.permissionTitle}>{status === 'requesting' ? 'Allow location access' : 'Location needed'}</Text>
      <Text style={styles.permissionCopy}>
        {status === 'requesting'
          ? 'Your phone should ask for permission now. We’ll use it once to find nearby cached bar intel.'
          : error || 'Enter a ZIP first, or allow location access to find bars near you.'}
      </Text>
    </View>
  );
}

function TrustLine() {
  return (
    <View style={styles.trustLine}>
      <Text style={styles.trustText}>We use this once to rank nearby drink value.</Text>
    </View>
  );
}

function RefreshingStatusStrip({ isDemo }: { isDemo: boolean }) {
  return (
    <View style={styles.refreshStrip}>
      <Text style={styles.refreshTitle}>{isDemo ? 'Generated demo preview' : 'Cached demo picks'}</Text>
      <Text style={styles.refreshCopy}>
        {isDemo
          ? 'These are placeholder bars only. Real bar/deal scraping is not connected yet.'
          : 'Showing cached demo data while the real scout worker is being built.'}
      </Text>
    </View>
  );
}

function RankedBarCard({ result }: { result: BarResult }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.rankPill}>
        <Text style={styles.rankText}>#{result.rank}</Text>
      </View>
      <View style={styles.cardMain}>
        <Text style={styles.barName}>{result.name}</Text>
        <Text style={styles.dealLabel}>Best known deal</Text>
        <Text style={styles.dealText}>{result.deal}</Text>
        <Text style={styles.economicsText}>{result.economics}</Text>
        <View style={styles.cardMetaRow}>
          <Text style={styles.scoreText}>{result.score} buzz/$</Text>
          <Text style={styles.distanceText}>{result.distance}</Text>
          <Text style={styles.freshnessText}>{result.freshness}</Text>
        </View>
      </View>
    </View>
  );
}

function PhoneNumberCapture({ phoneValue, onPhoneChange, onSubmit }: { phoneValue: string; onPhoneChange: (value: string) => void; onSubmit: () => void }) {
  return (
    <View style={styles.phoneSignupRow}>
      <TextInput
        placeholder="Phone number"
        placeholderTextColor="#8C8C8C"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        style={styles.phoneInput}
        value={phoneValue}
        onChangeText={onPhoneChange}
        onSubmitEditing={onSubmit}
      />
      <Pressable style={styles.notifyButton} onPress={onSubmit} accessibilityRole="button">
        <Text style={styles.notifyButtonText}>Text me</Text>
      </Pressable>
    </View>
  );
}

function ClerkPhoneVerification({ phoneValue, onPhoneChange }: { phoneValue: string; onPhoneChange: (value: string) => void }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [signupMessage, setSignupMessage] = useState<string | undefined>();

  const handleNotifyMe = async () => {
    const cleanedPhone = phoneValue.replace(/[^0-9+]/g, '');

    if (cleanedPhone.replace(/[^0-9]/g, '').length < 10) {
      setSignupMessage('Drop a real phone number so we can text you when the plan is ready.');
      return;
    }

    if (!isLoaded) {
      setSignupMessage('Auth is still loading. Try again in a sec.');
      return;
    }

    try {
      await signUp.create({ phoneNumber: cleanedPhone });
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setVerificationStep('code');
      setSignupMessage('Text code sent. Drop it in here and we’ll save your notification spot.');
    } catch {
      setSignupMessage('Could not start phone verification yet. Check the number and try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setSignupMessage('Enter the text code Clerk sent you.');
      return;
    }

    if (!isLoaded) return;

    try {
      const verification = await signUp.attemptPhoneNumberVerification({ code: verificationCode.trim() });
      if (verification.status === 'complete') {
        await setActive({ session: verification.createdSessionId });
        setVerificationStep('verified');
        setSignupMessage('Verified — we’ll text you when tonight’s best plans are ready.');
      } else {
        setSignupMessage('Almost there — Clerk needs one more verification step.');
      }
    } catch {
      setSignupMessage('That code did not verify. Try the latest text code.');
    }
  };

  if (verificationStep === 'code') {
    return (
      <>
        <View style={styles.phoneSignupRow}>
          <TextInput
            placeholder="Text code"
            placeholderTextColor="#8C8C8C"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            style={styles.phoneInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            onSubmitEditing={handleVerifyCode}
          />
          <Pressable style={styles.notifyButton} onPress={handleVerifyCode} accessibilityRole="button">
            <Text style={styles.notifyButtonText}>Verify code</Text>
          </Pressable>
        </View>
        {signupMessage ? <Text style={styles.signupMessage}>{signupMessage}</Text> : null}
      </>
    );
  }

  return (
    <>
      <PhoneNumberCapture phoneValue={phoneValue} onPhoneChange={onPhoneChange} onSubmit={handleNotifyMe} />
      {signupMessage ? <Text style={styles.signupMessage}>{signupMessage}</Text> : null}
    </>
  );
}

function LocalPhoneCapture({ phoneValue, onPhoneChange }: { phoneValue: string; onPhoneChange: (value: string) => void }) {
  const [signupMessage, setSignupMessage] = useState<string | undefined>();

  const handleNotifyMe = () => {
    const cleanedPhone = phoneValue.replace(/[^0-9]/g, '');

    if (cleanedPhone.length < 10) {
      setSignupMessage('Drop a real phone number so we can text you when the plan is ready.');
      return;
    }

    setSignupMessage('Saved locally for now — Clerk phone verification turns on when the production key is configured.');
  };

  return (
    <>
      <PhoneNumberCapture phoneValue={phoneValue} onPhoneChange={onPhoneChange} onSubmit={handleNotifyMe} />
      {signupMessage ? <Text style={styles.signupMessage}>{signupMessage}</Text> : null}
    </>
  );
}

function ScrapeSignupLoader({ phoneValue, onPhoneChange, scrapeJob }: { phoneValue: string; onPhoneChange: (value: string) => void; scrapeJob?: ScrapeJob }) {
  return (
    <View style={styles.scrapePanel}>
      <Image source={sleepingDrinksAsset} style={styles.sleepingDrinksImage} resizeMode="cover" accessibilityIgnoresInvertColors />
      <Text style={styles.scrapeEyebrow}>DEMO SCOUT PREVIEW</Text>
      <Text style={styles.scrapeTitle}>Demo scout preview</Text>
      <Text style={styles.scrapeCopy}>
        Real bar/deal scraping is not connected yet. This screen is a placeholder preview for the Mongo-backed Hermes worker we are building next.
      </Text>
      {scrapeJob ? <ScrapeProgressPanel job={scrapeJob} /> : null}
      {isClerkPhoneEnabled ? (
        <ClerkPhoneVerification phoneValue={phoneValue} onPhoneChange={onPhoneChange} />
      ) : (
        <LocalPhoneCapture phoneValue={phoneValue} onPhoneChange={onPhoneChange} />
      )}
      {scrapeJob?.step === 'complete' && scrapeJob.bars.length > 0 ? (
        <View style={styles.scrapeResultsList}>
          <Text style={styles.scrapeResultsTitle}>Tonight’s best bar plans</Text>
          {scrapeJob.bars.map((bar) => (
            <RankedBarCard key={bar.rank} result={bar} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
const SCRAPE_STEP_LABELS: Record<ScrapeStep, string> = {
  queued: 'Preparing demo preview…',
  scouting: 'Generating placeholder bars…',
  analyzing: 'Marking results as unverified…',
  ranking: 'Sorting demo cards…',
  complete: 'Demo preview ready',
};

function ScrapeProgressPanel({ job }: { job: ScrapeJob }) {
  const stepOrder: ScrapeStep[] = ['queued', 'scouting', 'analyzing', 'ranking', 'complete'];
  const currentIndex = stepOrder.indexOf(job.step);

  return (
    <View style={styles.scrapeProgressWrap}>
      {stepOrder.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <View key={step} style={[styles.scrapeStepRow, isActive && styles.scrapeStepActive]}>
            <Text style={[styles.scrapeStepDot, isDone && styles.scrapeStepDotDone, isActive && styles.scrapeStepDotActive]}>
              {isDone ? '✓' : isActive ? '◉' : '○'}
            </Text>
            <Text style={[styles.scrapeStepLabel, isDone && styles.scrapeStepLabelDone, isActive && styles.scrapeStepLabelActive]}>
              {SCRAPE_STEP_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function EmptyResultsScreen({
  lookup,
  phoneValue,
  onPhoneChange,
  onReset,
  scrapeJob,
}: {
  lookup: LookupContext;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  onReset: () => void;
  scrapeJob?: ScrapeJob;
}) {
  return (
    <SafeAreaView style={styles.screen} testID="empty-results-screen">
      <ScrollView contentContainerStyle={styles.resultsCanvas}>
        <StickerBadge />
        <Text style={styles.resultsTitle}>No cached picks yet</Text>
        <Text style={styles.resultsSubtitle}>{lookup.lookupLabel}</Text>
        <Text style={styles.filterText}>Default filter: within 30 minutes</Text>
        <ScrapeSignupLoader phoneValue={phoneValue} onPhoneChange={onPhoneChange} scrapeJob={scrapeJob} />
        <Pressable style={styles.secondaryButton} onPress={onReset} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Try another ZIP</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultsScreen({
  lookup,
  phoneValue,
  onPhoneChange,
  onReset,
  scrapeJob,
  themePreference,
  resolvedTheme,
  onThemeToggle,
}: {
  lookup: LookupContext;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  onReset: () => void;
  scrapeJob?: ScrapeJob;
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  onThemeToggle: () => void;
}) {
  const cachedFiltered = filterResultsForLookup(cachedResults, lookup);
  const visibleResults = cachedFiltered.length > 0
    ? cachedFiltered
    : (scrapeJob?.step === 'complete' ? scrapeJob.bars : []);

  if (visibleResults.length === 0) {
    return <EmptyResultsScreen lookup={lookup} phoneValue={phoneValue} onPhoneChange={onPhoneChange} onReset={onReset} scrapeJob={scrapeJob} />;
  }

  return (
    <SafeAreaView style={styles.screen} testID="results-screen">
      <ScrollView contentContainerStyle={styles.resultsCanvas}>
        <ThemeToggle preference={themePreference} resolvedTheme={resolvedTheme} onToggle={onThemeToggle} />
        <StickerBadge />
        <Text style={styles.resultsTitle}>Tonight’s cheapest buzz</Text>
        <Text style={styles.resultsSubtitle}>{lookup.lookupLabel}</Text>
        <RefreshingStatusStrip isDemo={cachedFiltered.length === 0} />
        <Text style={styles.loadedToast}>
          {cachedFiltered.length > 0
            ? `Showing cached demo picks for ${lookup.lookupLabel}.`
            : `Generated demo preview for ${lookup.lookupLabel}. These cards are not real verified bars yet.`
          }
        </Text>
        <Text style={styles.filterText}>Default filter: within 30 minutes</Text>
        <View style={styles.resultsList}>
          {visibleResults.map((result) => (
            <RankedBarCard key={result.rank} result={result} />
          ))}
        </View>
        <Pressable style={styles.secondaryButton} onPress={onReset} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Try another ZIP</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function LocationGate({
  zipValue,
  lookupError,
  locationStatus,
  onZipChange,
  onUseLocation,
  onZipSearch,
  themePreference,
  resolvedTheme,
  onThemeToggle,
}: {
  zipValue: string;
  lookupError?: string;
  locationStatus: LocationStatus;
  onZipChange: (value: string) => void;
  onUseLocation: () => void;
  onZipSearch: () => void;
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  onThemeToggle: () => void;
}) {
  return (
    <SafeAreaView style={styles.screen} testID="north-star-screen">
      <View style={styles.canvas}>
        <ThemeToggle preference={themePreference} resolvedTheme={resolvedTheme} onToggle={onThemeToggle} />
        <StickerBadge />

        <Text style={styles.heroTitle}>{HERO_TITLE.replace(' Get ', ' Get\n')}</Text>
        <Text style={styles.subtitle}>Find tonight’s best bar{`\n`}by buzz-per-dollar.</Text>

        <Text style={[styles.star, styles.starOne]}>✧</Text>
        <Text style={[styles.star, styles.starTwo]}>✧</Text>
        <Text style={[styles.star, styles.starThree]}>✧</Text>

        <DrinkSticker type="beer" style={styles.beerSticker} />
        <DrinkSticker type="martini" style={styles.martiniSticker} />
        <DrinkSticker type="wine" style={styles.wineSticker} />
        <DrinkSticker type="cocktail" style={styles.cocktailSticker} />

        <View style={styles.formArea}>
          <LocationButton onSearch={onUseLocation} status={locationStatus} />
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          <ZipSearch zipValue={zipValue} onZipChange={onZipChange} onSearch={onZipSearch} />
          <LocationPermissionPanel status={locationStatus} error={lookupError} />
          <TrustLine />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function NorthStarScreen() {
  const [screen, setScreen] = useState<'location' | 'results'>('location');
  const [zipValue, setZipValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [lookupError, setLookupError] = useState<string | undefined>();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [lookup, setLookup] = useState<LookupContext>({ kind: 'zip', zip: '23220', lookupLabel: 'Near 23220', maxDriveMinutes: 30 });
  const [scrapeJob, setScrapeJob] = useState<ScrapeJob | null>(null);
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null | undefined>(systemScheme);
  const resolvedTheme = resolveThemePreference(themePreference, systemTheme);
  tokens = resolvedTheme === 'dark' ? darkTokens : lightTokens;
  styles = createStyles(tokens);

  useEffect(() => {
    setSystemTheme(systemScheme);
  }, [systemScheme]);

  useEffect(() => {
    loadThemePreference().then(setThemePreference);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleThemePreference = () => {
    const nextPreference: ThemePreference = themePreference === 'system'
      ? (resolvedTheme === 'dark' ? 'light' : 'dark')
      : themePreference === 'dark'
        ? 'light'
        : 'system';
    setThemePreference(nextPreference);
    persistThemePreference(nextPreference);
  };

  useEffect(() => {
    let isMounted = true;

    loadPersistedAppState().then((restoredState) => {
      if (!isMounted || !restoredState) return;

      if (restoredState.zipValue) setZipValue(restoredState.zipValue);
      if (restoredState.phoneValue) setPhoneValue(restoredState.phoneValue);

      const restoredLookup = restoredState.lookup;
      if (restoredLookup?.zip) {
        setLookup(restoredLookup);
        setScreen('results');
      }
      if (restoredState.scrapeJob?.zip === restoredLookup?.zip && restoredState.scrapeJob.step === 'complete') {
        setScrapeJob(restoredState.scrapeJob);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    persistAppState({ zipValue, phoneValue, lookup, screen, scrapeJob: scrapeJob ?? undefined });
  }, [zipValue, phoneValue, lookup, screen, scrapeJob]);

  useEffect(() => {
    if (!scrapeJob || scrapeJob.step === 'complete') return;

    const stepDelays: Record<string, number> = {
      queued: 1200,
      scouting: 3000,
      analyzing: 3000,
      ranking: 2500,
    };

    const timer = setTimeout(() => {
      const stepOrder: ScrapeStep[] = ['queued', 'scouting', 'analyzing', 'ranking', 'complete'];
      const currentIndex = stepOrder.indexOf(scrapeJob.step);
      const nextStep = stepOrder[currentIndex + 1];

      if (nextStep === 'complete') {
        setScrapeJob({ ...scrapeJob, step: 'complete', bars: generateSimulatedBars(scrapeJob.zip) });
      } else {
        setScrapeJob({ ...scrapeJob, step: nextStep });
      }
    }, stepDelays[scrapeJob.step]);

    return () => clearTimeout(timer);
  }, [scrapeJob]);

  const startLookup = (nextLookup: LookupContext) => {
    setLookup(nextLookup);
    setLookupError(undefined);
    setLocationStatus('idle');
    const hasCached = filterResultsForLookup(cachedResults, nextLookup).length > 0;
    setScrapeJob(hasCached ? null : { step: 'queued', bars: [], startedAt: Date.now(), zip: nextLookup.zip });
    setScreen('results');
  };

  const handleZipSearch = () => {
    const cleanZip = zipValue.trim();
    if (!cleanZip) {
      setLookupError('Enter a ZIP first, then tap Find bars.');
      return;
    }

    startLookup({ kind: 'zip', zip: cleanZip, lookupLabel: `Near ${cleanZip}`, maxDriveMinutes: 30 });
  };

  const handleUseLocation = () => {
    setLookupError(undefined);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error');
      setLookupError('Location is not available here. Use this ZIP to find bars instead.');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const zip = await reverseGeocodeZip(latitude, longitude);
          setZipValue(zip);
          startLookup({ kind: 'gps', zip, lookupLabel: `Near ${zip}`, maxDriveMinutes: 30 });
        } catch {
          setLocationStatus('error');
          setLookupError('We got your location, but could not find the ZIP. Enter it below to find bars.');
        }
      },
      () => {
        setLocationStatus('error');
        setLookupError('Location was not allowed. Use this ZIP to find bars instead.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleReset = () => {
    setScrapeJob(null);
    setScreen('location');
  };

  if (screen === 'results') {
    return (
      <ResultsScreen
        lookup={lookup}
        phoneValue={phoneValue}
        onPhoneChange={setPhoneValue}
        onReset={handleReset}
        scrapeJob={scrapeJob ?? undefined}
        themePreference={themePreference}
        resolvedTheme={resolvedTheme}
        onThemeToggle={toggleThemePreference}
      />
    );
  }

  return (
    <LocationGate
      zipValue={zipValue}
      lookupError={lookupError}
      locationStatus={locationStatus}
      onZipChange={setZipValue}
      onUseLocation={handleUseLocation}
      onZipSearch={handleZipSearch}
      themePreference={themePreference}
      resolvedTheme={resolvedTheme}
      onThemeToggle={toggleThemePreference}
    />
  );
}

const createStyles = (tokens: ThemeTokens) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.paper,
    alignItems: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    minHeight: 820,
    backgroundColor: tokens.paper,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 58,
    position: 'relative',
    overflow: 'hidden',
  },
  resultsCanvas: {
    width: '100%',
    maxWidth: 430,
    minHeight: 820,
    backgroundColor: tokens.paper,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 34,
    alignItems: 'center',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    transform: [{ rotate: '-2deg' }],
  },
  badge: {
    backgroundColor: tokens.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    paddingVertical: 12,
    paddingHorizontal: 23,
    shadowColor: tokens.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  themeToggle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: tokens.softLine,
    backgroundColor: tokens.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  themeToggleIcon: {
    color: tokens.amber,
    fontSize: 17,
    fontWeight: '900',
  },
  themeToggleText: {
    color: tokens.ink,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  badgeText: {
    color: tokens.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.1,
    fontFamily: 'Impact',
  },
  spark: { gap: 5, marginHorizontal: 10 },
  sparkLeft: { alignItems: 'flex-end' },
  sparkRight: { alignItems: 'flex-start' },
  sparkLine: {
    width: 19,
    height: 4,
    borderRadius: 8,
    backgroundColor: tokens.lime,
    transform: [{ rotate: '18deg' }],
  },
  sparkLineMiddle: { width: 26, transform: [{ rotate: '0deg' }] },
  heroTitle: {
    color: tokens.ink,
    fontSize: 82,
    lineHeight: 83,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: -3.2,
    fontFamily: 'Arial Black',
    marginBottom: 28,
  },
  subtitle: {
    color: tokens.muted,
    fontSize: 25,
    lineHeight: 35,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 38,
  },
  formArea: {
    width: '100%',
    maxWidth: 355,
    alignItems: 'center',
    marginTop: 6,
    zIndex: 2,
  },
  locationButton: {
    width: '100%',
    height: 76,
    borderRadius: 22,
    backgroundColor: tokens.amber,
    borderWidth: 1,
    borderColor: tokens.amberDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 17,
    shadowColor: tokens.amber,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  locationPin: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderBottomRightRadius: 3,
    backgroundColor: tokens.ink,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPinHole: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: tokens.amber,
  },
  locationButtonText: {
    color: tokens.ink,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  orRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 31,
  },
  orLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: tokens.softLine,
  },
  orText: {
    color: tokens.muted,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  zipRow: {
    width: '100%',
    minHeight: 74,
    flexDirection: 'row',
    borderRadius: 25,
    backgroundColor: tokens.white,
    borderWidth: 1.2,
    borderColor: tokens.softLine,
    shadowColor: tokens.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  zipInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 19,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  zipIcon: { color: tokens.muted, fontSize: 24, fontWeight: '800' },
  zipInput: {
    flex: 1,
    color: tokens.ink,
    fontSize: 20,
    fontWeight: '600',
    outlineStyle: 'none' as never,
  },
  findButton: {
    minWidth: 114,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: tokens.lime,
    margin: -1,
    backgroundColor: tokens.white,
  },
  findButtonText: {
    color: tokens.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  trustLine: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 48,
  },
  permissionPanel: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: tokens.softLine,
    backgroundColor: tokens.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  permissionTitle: {
    color: tokens.ink,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  permissionCopy: {
    color: tokens.muted,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  trustText: {
    color: tokens.muted,
    fontSize: 15.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  drinkSticker: {
    position: 'absolute',
    width: 78,
    height: 96,
    zIndex: 1,
  },
  beerSticker: { left: 14, top: 315, transform: [{ rotate: '-8deg' }] },
  martiniSticker: { right: 13, top: 420, transform: [{ rotate: '9deg' }] },
  wineSticker: { left: -2, bottom: 22, transform: [{ rotate: '-5deg' }] },
  cocktailSticker: { right: -4, bottom: 3, transform: [{ rotate: '6deg' }] },
  star: {
    position: 'absolute',
    color: tokens.lime,
    fontSize: 33,
    fontWeight: '900',
  },
  starOne: { right: 66, top: 365 },
  starTwo: { right: 40, top: 406, fontSize: 24 },
  starThree: { right: 52, bottom: 198, fontSize: 22 },
  resultsTitle: {
    color: tokens.ink,
    fontSize: 44,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -2,
    fontFamily: 'Arial Black',
    textAlign: 'center',
    marginTop: -24,
  },
  resultsSubtitle: {
    color: tokens.muted,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  refreshStrip: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: tokens.softLine,
    backgroundColor: tokens.white,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  refreshTitle: {
    color: tokens.ink,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  refreshCopy: {
    color: tokens.muted,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
  },
  loadedToast: {
    width: '100%',
    color: tokens.muted,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  filterText: {
    width: '100%',
    color: tokens.lime,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  resultsList: {
    width: '100%',
    gap: 12,
  },
  resultCard: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1.3,
    borderColor: tokens.softLine,
    backgroundColor: tokens.white,
    padding: 14,
    shadowColor: tokens.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  rankPill: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: tokens.amber,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.amberDark,
  },
  rankText: {
    color: tokens.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardMain: { flex: 1 },
  barName: {
    color: tokens.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  dealLabel: {
    color: tokens.lime,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  dealText: {
    color: tokens.ink,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  economicsText: {
    color: tokens.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  scoreText: {
    color: tokens.ink,
    backgroundColor: tokens.overlay,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '900',
  },
  distanceText: {
    color: tokens.ink,
    backgroundColor: tokens.overlay,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '800',
  },
  freshnessText: {
    color: tokens.ink,
    backgroundColor: tokens.overlay,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '800',
  },
  scrapePanel: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: tokens.softLine,
    backgroundColor: tokens.card,
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  sleepingDrinksImage: {
    width: '100%',
    height: 132,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.softLine,
    backgroundColor: tokens.paper,
  },
  scrapeEyebrow: {
    color: tokens.lime,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 14,
  },
  scrapeTitle: {
    color: tokens.ink,
    fontSize: 25,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -1.2,
    textAlign: 'center',
    marginTop: 4,
  },
  scrapeCopy: {
    color: tokens.muted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  phoneSignupRow: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    borderRadius: 19,
    backgroundColor: tokens.white,
    borderWidth: 1.2,
    borderColor: tokens.softLine,
    marginTop: 14,
    overflow: 'hidden',
  },
  phoneInput: {
    flex: 1,
    color: tokens.ink,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 15,
    outlineStyle: 'none' as never,
  },
  notifyButton: {
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.amber,
    borderLeftWidth: 1.2,
    borderLeftColor: tokens.amberDark,
  },
  notifyButtonText: {
    color: tokens.ink,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  signupMessage: {
    color: tokens.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: tokens.softLine,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: tokens.white,
  },
  secondaryButtonText: {
    color: tokens.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  scrapeProgressWrap: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  scrapeStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    opacity: 0.45,
  },
  scrapeStepActive: {
    opacity: 1,
  },
  scrapeStepDot: {
    width: 20,
    textAlign: 'center',
    fontSize: 15,
    color: tokens.muted,
  },
  scrapeStepDotDone: {
    color: tokens.lime,
  },
  scrapeStepDotActive: {
    color: tokens.amber,
  },
  scrapeStepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.muted,
    flex: 1,
  },
  scrapeStepLabelDone: {
    color: tokens.ink,
  },
  scrapeStepLabelActive: {
    color: tokens.ink,
    fontWeight: '800',
  },
  scrapeResultsList: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  scrapeResultsTitle: {
    color: tokens.ink,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
});

let styles = createStyles(lightTokens);
