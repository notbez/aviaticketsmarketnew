import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.45;
const CLOSE_DISTANCE = 120;

const YEARS = Array.from({ length: 5 }, (_, i) => `${2025 + i}`);
const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

export default function DateWheelSheet({
  visible,
  initialDate = new Date(),
  onConfirm,
  onClose,
}) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  /* ===== INIT DATE ===== */
  useEffect(() => {
    if (visible) {
      setDay(initialDate.getDate());
      setMonth(initialDate.getMonth());
      setYear(initialDate.getFullYear());

      overlayOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withTiming(0, {
        duration: 280,
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

  /* ===== PAN (iOS ONLY) ===== */
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

  /* ===== DAYS ===== */
  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [month, year]
  );

  const DAYS = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

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
            {/* HEADER */}
            <View style={styles.header}>
              {Platform.OS === 'ios' ? (
                <View style={styles.grabber} />
              ) : (
                <Pressable onPress={close} style={styles.closeBtn}>
                  <MaterialCommunityIcons name="close" size={22} />
                </Pressable>
              )}
              <Text style={styles.title}>Выберите дату</Text>
            </View>

            {/* PICKERS */}
            <View style={styles.pickers}>
              <WheelPickerExpo
                height={160}
                width={70}
                initialSelectedIndex={day - 1}
                items={DAYS.map(d => ({ label: d, value: d }))}
                onChange={({ index }) => setDay(index + 1)}
              />

              <WheelPickerExpo
                height={160}
                width={140}
                initialSelectedIndex={month}
                items={MONTHS.map(m => ({ label: m, value: m }))}
                onChange={({ index }) => setMonth(index)}
              />

              <WheelPickerExpo
                height={160}
                width={90}
                initialSelectedIndex={YEARS.indexOf(String(year))}
                items={YEARS.map(y => ({ label: y, value: y }))}
                onChange={({ item }) => setYear(Number(item.value))}
              />
            </View>

            {/* CONFIRM */}
            <Pressable
              style={styles.confirmBtn}
              onPress={() => {
                const d = new Date(year, month, day);
                onConfirm(d);
                close();
              }}
            >
              <Text style={styles.confirmText}>Готово</Text>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

/* ===== STYLES ===== */

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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 6,
  },

  closeBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    padding: 6,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  pickers: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },

  confirmBtn: {
    marginTop: 20,
    backgroundColor: '#0277bd',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});