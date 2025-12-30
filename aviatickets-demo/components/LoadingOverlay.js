// components/LoadingOverlay.js
import React from 'react';
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

export default function LoadingOverlay() {
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 1600,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const planeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <BlurView intensity={70} tint="light" style={styles.overlay}>
      <View style={styles.card}>
        {/* ICON */}
        <Animated.View style={[styles.iconWrap, planeStyle]}>
          <MaterialCommunityIcons
            name="airplane"
            size={28}
            color="#0277bd"
          />
        </Animated.View>

        {/* TEXT */}
        <Text style={styles.title}>Ищем лучшие рейсы</Text>
        <Text style={styles.subtitle}>
          Это может занять до пары минут
        </Text>

        {/* DOTS */}
        <View style={styles.dots}>
          <Dot delay={0} />
          <Dot delay={200} />
          <Dot delay={400} />
        </View>
      </View>
    </BlurView>
  );
}

/* ===== DOT COMPONENT ===== */

function Dot({ delay }) {
  const scale = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: 280,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6F4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 17,
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
    marginTop: 16,
    gap: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0277bd',
  },
});