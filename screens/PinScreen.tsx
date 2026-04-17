import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, Vibration,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useWallet } from '../store/WalletContext';
import { Theme } from '../constants';
import { savePin, verifyPin } from '../services/pinService';

const PIN_LENGTH = 6;

const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['','0','⌫'],
];

type Mode = 'setup' | 'setup_confirm' | 'verify';

interface Props {
  mode: Mode;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PinScreen({ mode, onSuccess, onCancel }: Props) {
  const { isDarkMode, walletName } = useWallet();
  const T = isDarkMode ? Theme.colors : Theme.lightColors;

  const [pin, setPin]           = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep]         = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter');
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);

  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dotAnims   = useRef(Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Animate dot when pin changes
  useEffect(() => {
    const idx = pin.length - 1;
    if (idx >= 0) {
      Animated.sequence([
        Animated.spring(dotAnims[idx], { toValue: 1.3, useNativeDriver: true, speed: 40, bounciness: 12 }),
        Animated.spring(dotAnims[idx], { toValue: 1,   useNativeDriver: true, speed: 30, bounciness: 6  }),
      ]).start();
    }
  }, [pin]);

  const shake = useCallback(() => {
    Vibration.vibrate(Platform.OS === 'android' ? [0, 80, 60, 80] : 400);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleKey = useCallback(async (key: string) => {
    if (key === '') return;

    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length < PIN_LENGTH) return;

    // PIN complete
    if (mode === 'setup') {
      if (step === 'enter') {
        setFirstPin(newPin);
        setStep('confirm');
        setPin('');
        setError('');
        // Reset dot animations
        dotAnims.forEach(a => a.setValue(0));
        return;
      }
      // Confirm step
      if (newPin === firstPin) {
        await savePin(newPin);
        Vibration.vibrate(100);
        onSuccess();
      } else {
        shake();
        setError('PINs do not match. Try again.');
        setPin('');
        setStep('enter');
        setFirstPin('');
        dotAnims.forEach(a => a.setValue(0));
      }
      return;
    }

    // Verify mode
    const ok = await verifyPin(newPin);
    if (ok) {
      Vibration.vibrate(100);
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      shake();
      setError(newAttempts >= 5
        ? 'Too many attempts. Please wait.'
        : `Incorrect PIN. ${5 - newAttempts} attempt${5 - newAttempts !== 1 ? 's' : ''} left.`
      );
      setPin('');
      dotAnims.forEach(a => a.setValue(0));
    }
  }, [pin, mode, step, firstPin, attempts, shake, onSuccess, dotAnims]);

  const title = mode === 'setup'
    ? step === 'enter' ? 'Create PIN' : 'Confirm PIN'
    : 'Enter PIN';

  const subtitle = mode === 'setup'
    ? step === 'enter'
      ? 'Choose a 6-digit PIN to secure your wallet'
      : 'Re-enter your PIN to confirm'
    : `Welcome back, ${walletName}`;

  return (
    <Animated.View style={[styles.container, { backgroundColor: T.background, opacity: fadeAnim }]}>

      {/* Header */}
      <View style={styles.header}>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={[styles.cancelText, { color: T.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logo */}
      <View style={[styles.logoCircle, { backgroundColor: T.primary + '18' }]}>
        <Feather name="shield" size={36} color={T.primary} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: T.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: T.textMuted }]}>{subtitle}</Text>

      {/* PIN dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const filled = i < pin.length;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? T.primary : 'transparent',
                  borderColor: filled ? T.primary : T.border,
                  transform: [{ scale: dotAnims[i] }],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Error */}
      <View style={styles.errorWrap}>
        {!!error && (
          <Text style={[styles.errorText, { color: T.error }]}>{error}</Text>
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => (
              <TouchableOpacity
                key={ki}
                style={[
                  styles.key,
                  { backgroundColor: key === '' ? 'transparent' : T.surface, borderColor: T.border },
                  key === '⌫' && { backgroundColor: 'transparent' },
                ]}
                onPress={() => handleKey(key)}
                activeOpacity={key === '' ? 1 : 0.6}
                disabled={key === '' || (attempts >= 5 && mode === 'verify')}
              >
                {key === '⌫' ? (
                  <Feather name="delete" size={22} color={T.text} />
                ) : (
                  <Text style={[styles.keyText, { color: key === '' ? 'transparent' : T.text }]}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Step indicator for setup */}
      {mode === 'setup' && (
        <View style={styles.stepRow}>
          {['enter', 'confirm'].map((s, i) => (
            <View
              key={s}
              style={[styles.stepDot, {
                backgroundColor: step === s ? T.primary : T.border,
                width: step === s ? 20 : 8,
              }]}
            />
          ))}
        </View>
      )}

    </Animated.View>
  );
}

export { hasPinSetup, clearPin } from '../services/pinService';

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  header: { position: 'absolute', top: Platform.OS === 'web' ? 24 : 60, right: 24 },
  cancelBtn: { padding: 8 },
  cancelText: { fontSize: 15, fontWeight: '600' },

  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:    { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', marginBottom: 40, textAlign: 'center' },

  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },

  errorWrap: { height: 24, marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  keypad: { width: '100%', maxWidth: 320, gap: 12 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  key: {
    flex: 1, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  keyText: { fontSize: 26, fontWeight: '600' },

  stepRow: { flexDirection: 'row', gap: 8, marginTop: 32, alignItems: 'center' },
  stepDot: { height: 8, borderRadius: 4 },
});
