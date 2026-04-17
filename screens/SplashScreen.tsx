import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale      = useRef(new Animated.Value(0.3)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const ringScale      = useRef(new Animated.Value(0.5)).current;
  const ringOpacity    = useRef(new Animated.Value(0)).current;
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleY         = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // rings fade in
    Animated.timing(ringOpacity, { toValue: 0.18, duration: 600, useNativeDriver: true }).start();
    Animated.spring(ringScale,   { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 8 }).start();

    // logo pops in
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 14 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();

    // title slides up
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(titleOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]),
    ]).start();

    // tagline / badge
    Animated.sequence([
      Animated.delay(950),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // fade out → trigger navigation
    Animated.sequence([
      Animated.delay(2500),
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.wrapper, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#B00020" />

      {/* Background */}
      <View style={styles.bg} />

      {/* Decorative rings */}
      <Animated.View style={[styles.outerRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.View style={[styles.innerRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoMark, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.logoCircle}>
          <Feather name="shield" size={44} color="#FF3B3B" />
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
        CryptoWallet
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Digital Assets, Secured
      </Animated.Text>

      {/* Bottom badge */}
      <Animated.View style={[styles.bottomBadge, { opacity: taglineOpacity }]}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>Powered by ChainSplit</Text>
        <View style={styles.dot} />
      </Animated.View>
    </Animated.View>
  );
}

const RING = width * 1.1;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C00022',
  },
  outerRing: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 55,
    borderColor: '#FFFFFF',
    top:  height / 2 - RING / 2,
    left: width  / 2 - RING / 2,
  },
  innerRing: {
    position: 'absolute',
    width: RING * 0.55,
    height: RING * 0.55,
    borderRadius: (RING * 0.55) / 2,
    borderWidth: 28,
    borderColor: '#FFFFFF',
    top:  height / 2 - (RING * 0.55) / 2,
    left: width  / 2 - (RING * 0.55) / 2,
  },
  logoMark: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    marginTop: 10,
    letterSpacing: 0.4,
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.6,
  },
});
