// screens/ResultsScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import FlightCard from '../components/FlightCard';
import FlightDetails from '../components/FlightDetails';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function ResultsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const {
    results = [],
    from,
    to,
    fromName,
    toName,
  } = route.params || {};

  /* ===== MODAL ===== */

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = translateY.interpolate({
    inputRange: [0, SHEET_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const closingRef = useRef(false);

  /* ===== HELPERS ===== */

  const cityName = (code, name) =>
    name ? name.split('(')[0].trim() : code;

  /* ===== OPEN / CLOSE ===== */

  const openDetails = (flight) => {
    closingRef.current = false;
    setSelectedFlight(flight);
    setDetailsVisible(true);

    Animated.spring(translateY, {
      toValue: 0,
      damping: 22,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeDetails = () => {
    if (closingRef.current) return;
    closingRef.current = true;

    Animated.spring(translateY, {
      toValue: SHEET_HEIGHT,
      damping: 26,
      stiffness: 220,
      useNativeDriver: true,
    }).start(() => {
      setDetailsVisible(false);
      setSelectedFlight(null);
    });
  };

  /* ===== SWIPE ===== */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => g.dy > 0 && translateY.setValue(g.dy),
      onPanResponderRelease: (_, g) =>
        g.dy > 120
          ? closeDetails()
          : Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              stiffness: 180,
              useNativeDriver: true,
            }).start(),
    })
  ).current;

  /* ===== HEADER (SCROLLABLE) ===== */

  const ListHeader = () => (
    <View style={{ paddingTop: insets.top + 10 }}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.back}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Выбор рейса</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ROUTE */}
      <View style={styles.routeCard}>
        <Text
          style={styles.city}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {cityName(from, fromName)}
        </Text>

        <View style={styles.planeWrap}>
          <MaterialIcons name="flight" size={22} color="#0277bd" />
        </View>

        <Text
          style={styles.city}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {cityName(to, toName)}
        </Text>
      </View>

      {/* COUNT */}
      <Text style={styles.countText}>
        Найдено вариантов: <Text style={styles.countBold}>{results.length}</Text>
      </Text>
    </View>
  );

  /* ===== RENDER ===== */

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          String(item.id ?? item.providerId ?? index)
        }
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <FlightCard item={item} onBook={() => openDetails(item)} />
          </View>
        )}
      />

      {/* OVERLAY + SHEET */}
      {detailsVisible && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.3)',
                opacity: overlayOpacity,
                zIndex: 50,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeDetails}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY }] },
            ]}
          >
            <View
              style={styles.grabberZone}
              {...panResponder.panHandlers}
            >
              <View style={styles.grabber} />
            </View>

            {selectedFlight && (
              <FlightDetails
                flight={selectedFlight}
                navigation={navigation}
                onClose={closeDetails}
              />
            )}
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  back: { padding: 6 },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },

  routeCard: {
    marginHorizontal: 20,
    backgroundColor: '#f6f8fc',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  city: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },

  planeWrap: {
    width: 40,
    alignItems: 'center',
  },

  countText: {
    marginTop: 10,
    marginBottom: 16,
    marginHorizontal: 20,
    fontSize: 14,
    color: '#666',
  },

  countBold: {
    fontWeight: '800',
    color: '#111',
  },

  cardWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    height: SHEET_HEIGHT,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    zIndex: 60,
  },

  grabberZone: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
  },
});