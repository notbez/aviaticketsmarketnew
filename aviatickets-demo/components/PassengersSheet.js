// components/PassengersSheet.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const SHEET_HEIGHT = 320;
const CLOSE_DISTANCE = 120;

export default function PassengersSheet({
  visible,
  adults,
  children,
  infants,
  onChange,
  onClose,
}) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  const totalWithSeat = adults + children;

  /* ===== OPEN ===== */
  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withTiming(0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible]);

  /* ===== CLOSE ===== */
  const close = () => {
    overlayOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });

    translateY.value = withTiming(
      SHEET_HEIGHT,
      {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      },
      () => {
        runOnJS(onClose)?.();
      }
    );
  };

  /* ===== GESTURE (iOS only) ===== */
  const panGesture =
    Platform.OS === 'ios'
      ? Gesture.Pan()
          .onUpdate((e) => {
            if (e.translationY > 0) {
              translateY.value = e.translationY;
            }
          })
          .onEnd((e) => {
            if (e.translationY > CLOSE_DISTANCE) {
              runOnJS(close)();
            } else {
              translateY.value = withTiming(0, {
                duration: 180,
                easing: Easing.out(Easing.cubic),
              });
            }
          })
      : Gesture.Tap();

  /* ===== STYLES ===== */
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const Row = ({ title, subtitle, value, onMinus, onPlus }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onMinus} style={styles.btn}>
          <Text style={styles.btnTxt}>−</Text>
        </Pressable>

        <Text style={styles.value}>{value}</Text>

        <Pressable onPress={onPlus} style={styles.btn}>
          <Text style={styles.btnTxt}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        {/* OVERLAY */}
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>

        {/* SHEET */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <View style={styles.grabber} />

            <Row
              title="Взрослые"
              value={adults}
              onMinus={() =>
                adults > 1 &&
                onChange({ adults: adults - 1, children, infants })
              }
              onPlus={() =>
                totalWithSeat < 7 &&
                onChange({ adults: adults + 1, children, infants })
              }
            />

            <Row
              title="Дети"
              subtitle="2–12 лет"
              value={children}
              onMinus={() =>
                children > 0 &&
                onChange({ adults, children: children - 1, infants })
              }
              onPlus={() =>
                totalWithSeat < 7 &&
                onChange({ adults, children: children + 1, infants })
              }
            />

            <Row
              title="Младенцы"
              subtitle="до 2 лет"
              value={infants}
              onMinus={() =>
                infants > 0 &&
                onChange({ adults, children, infants: infants - 1 })
              }
              onPlus={() =>
                infants < adults &&
                onChange({ adults, children, infants: infants + 1 })
              }
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },

  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },

  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 12, color: '#777' },

  controls: { flexDirection: 'row', alignItems: 'center' },

  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTxt: { fontSize: 20, color: '#0277bd' },
  value: { marginHorizontal: 14, fontSize: 16, fontWeight: '700' },
});