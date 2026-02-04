import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Loading overlay with animated airplane following procedural flight path
 * Displays search progress with smooth animations and pulsing effects
 * TODO: Add customizable loading messages based on search type
 * TODO: Implement progress percentage display
 * TODO: Add sound effects for enhanced user experience
 */
export default function LoadingOverlay() {
  const time = useSharedValue(0);
  const pulse = useSharedValue(1);

  /**
   * Initialize continuous animations for airplane movement and card pulsing
   */
  useEffect(() => {
    time.value = withRepeat(
      withTiming(1000, {
        duration: 180000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withTiming(1.02, {
        duration: 2600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  /**
   * Generate procedural flight path with dynamic speed and radius variations
   */
  const planeStyle = useAnimatedStyle(() => {
    const t = time.value;

    const speed =
      0.45 +
      Math.sin(t * 0.12) * 0.18 +
      Math.sin(t * 0.035) * 0.12;

    const radius =
      0.6 +
      Math.sin(t * 0.11) * 0.3 +
      Math.sin(t * 0.03) * 0.25;

    const tt = t * speed;

    const x =
      (Math.sin(tt * 0.7) * 50 +
        Math.sin(tt * 0.21) * 22 +
        Math.sin(tt * 0.09) * 14) *
      radius;

    const y =
      (Math.cos(tt * 0.55) * 24 +
        Math.cos(tt * 0.18) * 18 +
        Math.sin(tt * 0.12) * 12) *
      radius;

    const dx =
      (Math.cos(tt * 0.7) * 50 * 0.7 +
        Math.cos(tt * 0.21) * 22 * 0.21 +
        Math.cos(tt * 0.09) * 14 * 0.09) *
      radius *
      speed;

    const dy =
      (-Math.sin(tt * 0.55) * 24 * 0.55 +
        -Math.sin(tt * 0.18) * 18 * 0.18 +
        Math.cos(tt * 0.12) * 12 * 0.12) *
      radius *
      speed;

    const curvature = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 80);
    const turnSlowdown = 1 - curvature * 0.5;

    const iconCorrection = -Math.PI / -4;
    const rotation =
      Math.atan2(dy * turnSlowdown, dx * turnSlowdown) + iconCorrection;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}rad` },
      ],
    };
  });

  /**
   * Apply pulsing animation to the main card
   */
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <BlurView intensity={80} tint="light" style={styles.overlay}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.scene}>
          <Animated.View style={planeStyle}>
            <MaterialCommunityIcons
              name="airplane"
              size={32}
              color="#0277bd"
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>Ищем лучшие рейсы</Text>
        <Text style={styles.subtitle}>
          Анализируем возможные маршруты
        </Text>

        <Dots />
      </Animated.View>
    </BlurView>
  );
}

/**
 * Animated dots component for loading indication
 */
function Dots() {
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);

  /**
   * Initialize staggered dot animations
   */
  useEffect(() => {
    d1.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    d2.value = withRepeat(withTiming(1, { duration: 900, delay: 150 }), -1, true);
    d3.value = withRepeat(withTiming(1, { duration: 900, delay: 300 }), -1, true);
  }, []);

  /**
   * Generate animated style for individual dot
   */
  const dot = (v) =>
    useAnimatedStyle(() => ({
      opacity: 0.3 + v.value * 0.7,
      transform: [{ scale: 0.7 + v.value * 0.4 }],
    }));

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, dot(d1)]} />
      <Animated.View style={[styles.dot, dot(d2)]} />
      <Animated.View style={[styles.dot, dot(d3)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  scene: {
    width: 200,
    height: 120,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0277bd',
  },
});