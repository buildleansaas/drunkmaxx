import React from 'react';
import {
  Pressable,
  SafeAreaView,
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
  type: 'beer' | 'martini' | 'wine' | 'citrus';
  style?: object;
};

const drinkMeta = {
  beer: { emoji: '🍺', face: '◕‿◕', tint: '#F8B940' },
  martini: { emoji: '🍸', face: '⌣', tint: '#F8F8F3' },
  wine: { emoji: '🍷', face: '•‿•', tint: '#C44B59' },
  citrus: { emoji: '🍹', face: '＾▽＾', tint: '#F3B13B' },
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

function DrinkSticker({ type, style }: DrinkStickerProps) {
  const meta = drinkMeta[type];
  return (
    <View style={[styles.drinkSticker, style]}>
      <Text style={styles.drinkEmoji}>{meta.emoji}</Text>
      <Text style={styles.drinkFace}>{meta.face}</Text>
      <View style={[styles.drinkArm, styles.leftArm]} />
      <View style={[styles.drinkArm, styles.rightArm]} />
      <View style={[styles.drinkLeg, styles.leftLeg]} />
      <View style={[styles.drinkLeg, styles.rightLeg]} />
    </View>
  );
}

function LocationPin() {
  return (
    <View style={styles.locationPin}>
      <View style={styles.locationPinHole} />
    </View>
  );
}

function LocationButton() {
  return (
    <Pressable style={styles.locationButton} accessibilityRole="button">
      <LocationPin />
      <Text style={styles.locationButtonText}>Use my location</Text>
    </Pressable>
  );
}

function ZipSearch() {
  return (
    <View style={styles.zipRow}>
      <View style={styles.zipInputWrap}>
        <Text style={styles.zipIcon}>⌖</Text>
        <TextInput
          placeholder="Enter ZIP code"
          placeholderTextColor="#9B9B9B"
          keyboardType="number-pad"
          style={styles.zipInput}
        />
      </View>
      <Pressable style={styles.findButton} accessibilityRole="button">
        <Text style={styles.findButtonText}>Find bars</Text>
      </Pressable>
    </View>
  );
}

function TrustLine() {
  return (
    <View style={styles.trustLine}>
      <View style={styles.lockBubble}>
        <Text style={styles.lockText}>▢</Text>
      </View>
      <Text style={styles.trustText}>We use this once to rank nearby drink value.</Text>
    </View>
  );
}

export default function NorthStarScreen() {
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
        <DrinkSticker type="citrus" style={styles.citrusSticker} />

        <View style={styles.formArea}>
          <LocationButton />
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          <ZipSearch />
          <TrustLine />
        </View>
      </View>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    marginTop: 31,
  },
  lockBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: { color: tokens.lime, fontSize: 20, fontWeight: '900' },
  trustText: { color: '#565656', fontSize: 15.5, fontWeight: '500' },
  drinkSticker: {
    position: 'absolute',
    width: 74,
    height: 92,
    borderRadius: 28,
    backgroundColor: tokens.white,
    borderWidth: 4,
    borderColor: tokens.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
  },
  drinkEmoji: { fontSize: 44, lineHeight: 48 },
  drinkFace: {
    position: 'absolute',
    top: 39,
    color: tokens.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  drinkArm: {
    position: 'absolute',
    width: 19,
    height: 3,
    backgroundColor: tokens.ink,
    borderRadius: 6,
  },
  leftArm: { left: -7, top: 51, transform: [{ rotate: '55deg' }] },
  rightArm: { right: -8, top: 43, transform: [{ rotate: '-55deg' }] },
  drinkLeg: {
    position: 'absolute',
    width: 3,
    height: 21,
    backgroundColor: tokens.ink,
    borderRadius: 6,
    bottom: -11,
  },
  leftLeg: { left: 25, transform: [{ rotate: '28deg' }] },
  rightLeg: { right: 25, transform: [{ rotate: '-28deg' }] },
  beerSticker: { left: 28, top: 330, transform: [{ rotate: '-8deg' }] },
  martiniSticker: { right: 28, top: 424, transform: [{ rotate: '9deg' }] },
  wineSticker: { left: 28, bottom: 100, transform: [{ rotate: '-5deg' }] },
  citrusSticker: { right: 28, bottom: 55, transform: [{ rotate: '6deg' }] },
  star: {
    position: 'absolute',
    color: tokens.lime,
    fontSize: 33,
    fontWeight: '900',
  },
  starOne: { right: 66, top: 365 },
  starTwo: { right: 40, top: 406, fontSize: 24 },
  starThree: { right: 52, bottom: 198, fontSize: 22 },
});
