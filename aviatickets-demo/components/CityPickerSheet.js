import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;
const CLOSE_DISTANCE = 120;

export default function CityPickerSheet({
  visible,
  cities = [],
  onSelect,
  onClose,
}) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const [query, setQuery] = useState('');

  /* ===== OPEN ===== */
  useEffect(() => {
    if (visible) {
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
        runOnJS(setQuery)('');
        runOnJS(onClose)?.();
      }
    );
  };

  /* ===== iOS SWIPE ONLY ===== */
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
      : Gesture.Tap(); // Android — отключаем свайп полностью

  /* ===== ANIM STYLES ===== */
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  /* ===== FILTER ===== */
  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
  );

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
              <Text style={styles.title}>Выберите направление</Text>
            </View>

            {/* SEARCH */}
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#888" />
              <TextInput
                placeholder="Город или страна"
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
              />
            </View>

            {/* LIST */}
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={query ? filtered : cities}
              keyExtractor={(i) => `${i.code}-${i.name}`}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                >
                  <Text style={styles.cityText}>
                    {item.code} — {item.name}
                  </Text>
                </Pressable>
              )}
            />
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 15,
    flex: 1,
  },

  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  cityText: {
    fontSize: 15,
    color: '#222',
  },
});