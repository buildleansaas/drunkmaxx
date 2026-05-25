import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const tokens = {
  paper: '#FAF8F2',
  ink: '#111111',
  muted: '#5F5F5F',
  softLine: '#E6DDD1',
  amber: '#F6B329',
  amberDark: '#D79611',
  lime: '#9BAE12',
  red: '#B3263B',
  white: '#FFFDF8',
};

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
};

type LookupContext = {
  kind: 'gps' | 'zip';
  lookupLabel: string;
};

type LocationStatus = 'idle' | 'requesting' | 'error';

const drinkAssets: Record<DrinkStickerProps['type'], ImageSourcePropType> = {
  beer: require('../assets/drinks/beer.png'),
  martini: require('../assets/drinks/martini.png'),
  wine: require('../assets/drinks/wine.png'),
  cocktail: require('../assets/drinks/cocktail.png'),
};

const cachedResults: BarResult[] = [
  {
    rank: 1,
    name: 'Cobra Cabana',
    deal: '$3.50 High Life',
    economics: '12oz · 4.6% · $3.50',
    score: 94,
    distance: '0.7 mi',
    freshness: 'Updated 3h ago',
  },
  {
    rank: 2,
    name: 'Bamboo Cafe',
    deal: '$4 rail whiskey',
    economics: '1.5oz · 40% · $4',
    score: 89,
    distance: '1.1 mi',
    freshness: 'Updated today',
  },
  {
    rank: 3,
    name: 'GWARbar',
    deal: '$5 draft special',
    economics: '16oz · 5.2% · $5',
    score: 82,
    distance: '1.4 mi',
    freshness: 'Refreshing',
  },
];

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

function RefreshingStatusStrip() {
  return (
    <View style={styles.refreshStrip}>
      <Text style={styles.refreshTitle}>Refreshing drink intel</Text>
      <Text style={styles.refreshCopy}>Using cached picks while we check for updates.</Text>
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

function DancingDrinksLoader() {
  return (
    <View style={styles.loaderPanel}>
      <View style={styles.danceRow}>
        <Image source={drinkAssets.beer} style={[styles.danceDrink, styles.danceOne]} resizeMode="contain" />
        <Image source={drinkAssets.martini} style={[styles.danceDrink, styles.danceTwo]} resizeMode="contain" />
        <Image source={drinkAssets.wine} style={[styles.danceDrink, styles.danceThree]} resizeMode="contain" />
        <Image source={drinkAssets.cocktail} style={[styles.danceDrink, styles.danceFour]} resizeMode="contain" />
      </View>
      <View style={styles.loaderTextBlock}>
        <Text style={styles.loaderTitle}>Checking tonight’s drink intel</Text>
        <Text style={styles.loaderStage}>Looking for menus…</Text>
      </View>
    </View>
  );
}

function ResultsScreen({ lookup, onReset }: { lookup: LookupContext; onReset: () => void }) {
  return (
    <SafeAreaView style={styles.screen} testID="results-screen">
      <ScrollView contentContainerStyle={styles.resultsCanvas}>
        <StickerBadge />
        <Text style={styles.resultsTitle}>Tonight’s cheapest buzz</Text>
        <Text style={styles.resultsSubtitle}>{lookup.lookupLabel}</Text>
        <RefreshingStatusStrip />
        <Text style={styles.loadedToast}>Showing cached picks for {lookup.lookupLabel} while we refresh tonight’s deals.</Text>
        <DancingDrinksLoader />
        <View style={styles.resultsList}>
          {cachedResults.map((result) => (
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
}: {
  zipValue: string;
  lookupError?: string;
  locationStatus: LocationStatus;
  onZipChange: (value: string) => void;
  onUseLocation: () => void;
  onZipSearch: () => void;
}) {
  return (
    <SafeAreaView style={styles.screen} testID="north-star-screen">
      <View style={styles.canvas}>
        <StickerBadge />

        <Text style={styles.heroTitle}>Let’s Get{`\n`}Drunk</Text>
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
  const [lookupError, setLookupError] = useState<string | undefined>();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [lookup, setLookup] = useState<LookupContext>({ kind: 'zip', lookupLabel: 'Near 23220' });

  const startLookup = (nextLookup: LookupContext) => {
    setLookup(nextLookup);
    setLookupError(undefined);
    setLocationStatus('idle');
    setScreen('results');
  };

  const handleZipSearch = () => {
    const cleanZip = zipValue.trim();
    if (!cleanZip) {
      setLookupError('Enter a ZIP first, then tap Find bars.');
      return;
    }

    startLookup({ kind: 'zip', lookupLabel: `Near ${cleanZip}` });
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
      (position) => {
        const { latitude, longitude } = position.coords;
        startLookup({
          kind: 'gps',
          lookupLabel: `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
        });
      },
      () => {
        setLocationStatus('error');
        setLookupError('Location was not allowed. Use this ZIP to find bars instead.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  if (screen === 'results') {
    return <ResultsScreen lookup={lookup} onReset={() => setScreen('location')} />;
  }

  return (
    <LocationGate
      zipValue={zipValue}
      lookupError={lookupError}
      locationStatus={locationStatus}
      onZipChange={setZipValue}
      onUseLocation={handleUseLocation}
      onZipSearch={handleZipSearch}
    />
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 38,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
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
    color: '#565656',
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
    marginTop: 8,
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
    backgroundColor: '#D2D0CB',
  },
  orText: {
    color: '#6F6F6F',
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
    borderColor: '#EEE6DC',
    shadowColor: '#000',
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
  zipIcon: { color: '#9B9B9B', fontSize: 24, fontWeight: '800' },
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
    borderColor: '#E8DCCB',
    backgroundColor: '#FFF9ED',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
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
    color: '#565656',
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
    fontSize: 50,
    lineHeight: 52,
    fontWeight: '900',
    letterSpacing: -2,
    fontFamily: 'Arial Black',
    textAlign: 'center',
    marginTop: -20,
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
    borderColor: '#E8DCCB',
    backgroundColor: tokens.white,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
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
    color: '#4D4D4D',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
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
    borderColor: '#E8DCCB',
    backgroundColor: tokens.white,
    padding: 14,
    shadowColor: '#000',
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
    backgroundColor: '#F5EBCB',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '900',
  },
  distanceText: {
    color: tokens.ink,
    backgroundColor: '#EFF0D6',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '800',
  },
  freshnessText: {
    color: tokens.muted,
    backgroundColor: '#F3EEE7',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontWeight: '800',
  },
  loaderPanel: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8DCCB',
    backgroundColor: '#FFF9ED',
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  loaderTextBlock: {
    flex: 1,
    paddingLeft: 8,
  },
  loaderTitle: {
    color: tokens.ink,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  loaderCopy: {
    color: tokens.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 7,
  },
  danceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 142,
    height: 58,
  },
  danceDrink: { width: 42, height: 52, marginHorizontal: -5 },
  danceOne: { transform: [{ rotate: '-8deg' }, { translateY: 5 }] },
  danceTwo: { transform: [{ rotate: '6deg' }, { translateY: -6 }] },
  danceThree: { transform: [{ rotate: '-4deg' }, { translateY: 2 }] },
  danceFour: { transform: [{ rotate: '8deg' }, { translateY: -4 }] },
  loaderStage: {
    color: tokens.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  secondaryButton: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#D8CCBC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: tokens.white,
  },
  secondaryButtonText: {
    color: tokens.ink,
    fontSize: 16,
    fontWeight: '900',
  },
});
