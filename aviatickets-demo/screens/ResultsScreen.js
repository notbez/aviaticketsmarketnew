// screens/ResultsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import FlightCard from '../components/FlightCard';
import FlightDetails from '../components/FlightDetails';

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

  const { width } = Dimensions.get('window');

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const getDisplayName = (code, fullName) => {
    if (fullName) return fullName.split('(')[0].trim();

    const airports = {
      SVO: 'Москва',
      DME: 'Москва',
      VKO: 'Москва',
      TJM: 'Тюмень',
      OVB: 'Новосибирск',
    };

    return airports[code] || code;
  };

const openDetails = (flight) => {
  setSelectedFlight(flight);
  setDetailsVisible(true);

  Animated.timing(overlayOpacity, {
    toValue: 1,
    duration: 260,
    useNativeDriver: true,
  }).start();
};

const closeDetails = () => {
  Animated.timing(overlayOpacity, {
    toValue: 0,
    duration: 220,
    useNativeDriver: true,
  }).start(() => {
    setDetailsVisible(false);
    setSelectedFlight(null);
  });
};


  return (
    <SafeAreaView style={styles.safe}>

      {/* ===== WAVE BACKGROUND ===== */}
      <View style={styles.waveWrapper}>
        <Svg width={width} height={330} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
  <Stop offset="0" stopColor="#1EA6FF" stopOpacity="1" />
  <Stop offset="1" stopColor="#1EA6FF" stopOpacity="1" />
</LinearGradient>

            <LinearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
</LinearGradient>
          </Defs>

          <Path
            d={`M0 0 L0 230 Q ${width / 2} 330 ${width} 230 L${width} 0 Z`}
            fill="url(#grad)"
          />

          <Path
  d={`M0 60 Q ${width / 2} 160 ${width} 120 L${width} 0 L0 0 Z`}
  fill="url(#lightGrad)"
/>

          <Path
            d={`M0 120 Q ${width / 2} 240 ${width} 170 L${width} 0 L0 0 Z`}
            fill="url(#lightGrad)"
            opacity={0.4}
          />
        </Svg>

        {/* ===== HEADER CONTENT ===== */}
        <View style={[styles.waveContent, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backIcon}>
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Выберите рейс</Text>

          <View style={styles.routeRow}>
            <Text style={styles.routeCity}>
              {getDisplayName(from, fromName)}
            </Text>
            <MaterialIcons
              name="airplanemode-active"
              size={22}
              color="#fff"
              style={{ marginHorizontal: 10 }}
            />
            <Text style={styles.routeCity}>
              {getDisplayName(to, toName)}
            </Text>
          </View>

          <Text style={styles.routeCodes}>
            {from} — {to}
          </Text>

          <View style={styles.resultsChip}>
  <MaterialIcons name="flight-takeoff" size={18} color="#0277bd" />
  <Text style={styles.resultsChipText}>
    Найдено {results.length} вариантов
  </Text>
</View>
        </View>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          String(item.id ?? item.providerId ?? index)
        }
        contentContainerStyle={{
          paddingTop: 330,
          paddingBottom: 24,
        }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <FlightCard item={item} onBook={() => openDetails(item)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Рейсы не найдены</Text>
            <Text style={styles.emptySubtitle}>
              Попробуйте изменить параметры поиска
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigation.goBack}
            >
              <Text style={styles.backButtonText}>Изменить поиск</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ===== MODAL ===== */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="none"
        onRequestClose={() => setDetailsVisible(false)}
      >

        <View style={styles.modalContainer}>
          <Animated.View
    pointerEvents="none"
    style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: 'rgba(0,0,0,0.35)',
        opacity: overlayOpacity,
      },
    ]}
  />
            {selectedFlight && (
              <FlightDetails
                flight={selectedFlight}
                navigation={navigation}
                onClose={closeDetails}
              />
            )}
          </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  waveWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 330,
    zIndex: 10,
  },

  waveContent: {
    paddingHorizontal: 20,
  },

  backIcon: {
    padding: 8,
    alignSelf: 'flex-start',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },

  routeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  routeCity: {
    color: '#fff',
    fontSize: 18,
  },

  routeCodes: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },

  resultsHeader: {
    marginTop: 18,
    backgroundColor: '#ffffffdd',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },

  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  resultsSubtext: {
    fontSize: 14,
    color: '#666',
  },

  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: '#2aa8ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

modalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
},

resultsChip: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginTop: 60,
  alignSelf: 'center',
  backgroundColor: 'rgba(255,255,255,0.85)',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
},

resultsChipText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#0277bd',
},
});