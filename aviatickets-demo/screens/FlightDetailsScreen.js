// screens/FlightDetailsScreen.js
import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

export default function FlightDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { flight } = route.params || {}; // flight as produced by FlightsService.routeToCard
  const { width } = Dimensions.get("window");

  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const fares = flight?.fares || [];
  const firstFare = fares[selectedFareIndex] || fares[0] || null;
  const [activeTab, setActiveTab] = useState('info');
  const scrollY = useSharedValue(0);

  // helper to format price
  const formatPrice = (v) => {
    if (v == null) return '-';
    try {
      return Number(v).toLocaleString('ru-RU') + ' ₽';
    } catch {
      return `${v} ₽`;
    }
  };

  // safe strings
  const safe = (v) => (v === null || v === undefined ? '-' : v);

  // fallback price for header
  const headerPrice = useMemo(() => {
    return formatPrice(firstFare?.amount ?? flight?.price);
  }, [firstFare]);

  const blurAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 120],
        [0.15, 0.35], // слабый → чуть сильнее
        Extrapolate.CLAMP
      ),
    };
  });
  return (
<SafeAreaView style={styles.safe}>
<View style={styles.waveWrapper}>
  {/* === GLASS / BLUR MASK === */}
  {Platform.OS === 'ios' && (
    <MaskedView
      style={StyleSheet.absoluteFill}
      maskElement={
        <Svg width="100%" height={360}>
          <Path
            d={`M0 0 L0 250 Q ${width * 0.5} 350 ${width} 250 L${width} 0 Z`}
            fill="black"
          />
        </Svg>
      }
    >
      {/* Blur (ослабили) */}
      <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
  <BlurView
    intensity={30}   // ослабили
    tint="light"
    style={StyleSheet.absoluteFill}
  />
</Animated.View>

      {/* Цвет стекла — ТВОЙ */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(30,166,255,0.22)',
        }}
      />
    </MaskedView>
  )}

  {/* === SVG WAVE (ТОЧНО КАК В ОБРАЗЦЕ) === */}
  <Svg width="100%" height={360} style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1EA6FF" stopOpacity="1" />
        <Stop offset="1" stopColor="#1EA6FF" stopOpacity="0.65" />
      </LinearGradient>

      <LinearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#5FCFFF" stopOpacity="0.3" />
        <Stop offset="1" stopColor="#1EA6FF" stopOpacity="0" />
      </LinearGradient>
    </Defs>

    {/* Основная форма */}
    <Path
      d={`M0 0 L0 250 Q ${width * 0.5} 350 ${width} 250 L${width} 0 Z`}
      fill="url(#grad)"
    />

    {/* Световые слои */}
    <Path
      d={`M0 70 Q ${width * 0.5} 170 ${width} 130 L${width} 0 L0 0 Z`}
      fill="url(#lightGrad)"
      opacity="0.6"
    />

    <Path
      d={`M0 130 Q ${width * 0.5} 260 ${width} 190 L${width} 0 L0 0 Z`}
      fill="url(#lightGrad)"
      opacity="0.4"
    />
  </Svg>

  {/* === CONTENT === */}
  <View style={[styles.waveContent, { paddingTop: insets.top + 16 }]}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <MaterialIcons name="arrow-back" size={26} color="#fff" />
    </TouchableOpacity>

    <View style={{ marginTop: 20, alignItems: 'center' }}>
      <Text style={styles.routeCityMain}>
        {flight?.from} → {flight?.to}
      </Text>
      <Text style={styles.headerPrice}>{headerPrice}</Text>
    </View>
  </View>
</View>

  {/* Scrollable content */}
  <Animated.ScrollView
  style={styles.content}
  contentContainerStyle={{ paddingTop: 220, paddingBottom: 40 }}
  scrollEventThrottle={16}
  onScroll={(event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }}
>
        {/* Tariffs Section */}
        {fares && fares.length > 0 && (
          <View style={styles.tariffsWrapper}>
            <Text style={styles.tariffTitle}>Тарифы</Text>

            <FlatList
              horizontal
              data={fares}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              snapToInterval={272}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / 272);
                setSelectedFareIndex(index);
              }}
              renderItem={({ item: fare, index }) => {
                const active = selectedFareIndex === index;
                return (
                  <TouchableOpacity
                    style={[styles.tariffCard, active && styles.tariffCardActive]}
                    onPress={() => setSelectedFareIndex(index)}
                  >
                    <View style={styles.tariffHeader}>
                      <Text style={styles.tariffName}>{safe(fare.title)}</Text>
                      <Text style={styles.tariffPrice}>
                        {formatPrice(fare.amount)}
                      </Text>
                    </View>

                    <View style={styles.tariffFeatures}>
                      <View style={styles.tariffFeatureRow}>
                        <MaterialCommunityIcons
                          name="bag-suitcase-outline"
                          size={18}
                          color="#0277bd"
                        />
                        <Text style={styles.tariffFeatureText}>
                          Багаж: {safe(fare.baggage)}
                        </Text>
                      </View>

                      <View style={styles.tariffFeatureRow}>
                        <MaterialCommunityIcons
                          name="bag-carry-on"
                          size={18}
                          color="#0277bd"
                        />
                        <Text style={styles.tariffFeatureText}>
                          Ручная кладь: {safe(fare.carryOn)}
                        </Text>
                      </View>

                      <View style={styles.tariffFeatureRow}>
                        <MaterialCommunityIcons
                          name="silverware-fork-knife"
                          size={18}
                          color="#0277bd"
                        />
                        <Text style={styles.tariffFeatureText}>
                          Питание: {safe(fare.meal)}
                        </Text>
                      </View>

                      <View style={styles.tariffFeatureRow}>
                        <MaterialCommunityIcons
                          name="swap-horizontal"
                          size={18}
                          color="#666"
                        />
                        <Text style={styles.tariffFeatureText}>
                          Обмен: {safe(fare.exchange)}
                        </Text>
                      </View>

                      <View style={styles.tariffFeatureRow}>
                        <MaterialCommunityIcons
                          name="cash-refund"
                          size={18}
                          color="#666"
                        />
                        <Text style={styles.tariffFeatureText}>
                          Возврат: {safe(fare.refund)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton
            title="Информация о рейсе"
            active={activeTab === 'info'}
            onPress={() => setActiveTab('info')}
          />
          <TabButton
            title="Возврат и перенос"
            active={activeTab === 'rules'}
            onPress={() => setActiveTab('rules')}
          />
        </View>

        {/* Content: Flight info */}
        {activeTab === 'info' && (
          <View style={styles.infoCard}>
            <View style={styles.airlineRow}>
              <Text style={styles.airlineName}>
                {flight?.providerRaw?.Flights?.[0]?.MarketingAirlineCode ||
                  flight?.segments?.[0]?.flights?.[0]?.marketingAirline ||
                  'Авиакомпания'}
                {` — ${firstFare?.title || ''}`}
              </Text>
              <Text style={styles.flightNumber}>
                {flight?.segments?.[0]?.flights?.[0]?.flightNumber || ''}
              </Text>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Вылет</Text>
                <Text style={styles.routeValue}>
                  {flight?.from || '—'} {formatTimeOrDefault(flight?.departTime)}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDateLong(flight?.departTime)}
                </Text>
              </View>

              <View style={styles.durationBlock}>
                <MaterialIcons name="flight" size={20} color="#666" />
                <Text style={styles.durationText}>
                  {flight?.duration || '—'}
                </Text>
              </View>

              <View style={styles.routeItem}>
                <Text style={styles.routeLabel}>Прилет</Text>
                <Text style={styles.routeValue}>
                  {flight?.to || '—'} {formatTimeOrDefault(flight?.arrivalTime)}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDateLong(flight?.arrivalTime)}
                </Text>
              </View>
            </View>

            {/* Fare details */}
            <View style={styles.fareDetails}>
              <Text style={styles.priceTitle}>Детали тарифа</Text>

              <View style={styles.detailGrid}>
                <DetailRow label="Багаж" value={safe(firstFare?.baggage)} />
                <DetailRow label="Ручная кладь" value={safe(firstFare?.carryOn)} />
                <DetailRow label="Питание" value={safe(firstFare?.meal)} />
                <DetailRow label="Обмен" value={safe(firstFare?.exchange)} />
                <DetailRow label="Возврат" value={safe(firstFare?.refund)} />
              </View>

              {firstFare?.raw?.RulesText ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.priceTitle}>Правила тарифа</Text>
                  <Text style={styles.rulesText}>
                    {String(firstFare.raw.RulesText).slice(0, 180)}
                    {String(firstFare.raw.RulesText).length > 180 ? '…' : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Content: Rules */}
        {activeTab === 'rules' && (
          <View style={styles.infoCard}>
            <Text style={styles.priceTitle}>Возврат и обмен</Text>
            <Text style={styles.rulesText}>{safe(firstFare?.refund)}</Text>
            <Text style={[styles.rulesText, { marginTop: 8 }]}>
              {safe(firstFare?.exchange)}
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.selectSeatsButton}
          onPress={() =>
            navigation.navigate('PassengerInfo', {
              offerId: flight.offerId,
              selectedBrandId: firstFare?.brandId,
              price: firstFare?.amount,
                 })
          }
        >
          <Text style={styles.selectSeatsButtonText}>Продолжить</Text>
        </TouchableOpacity>
        </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------
   Helper Components
   ------------------------- */
function TabButton({ title, active = false, onPress = () => {} }) {
  return (
    <TouchableOpacity
      style={[tabStyles.tab, active && tabStyles.tabActive]}
      onPress={onPress}
    >
      <Text style={[tabStyles.tabText, active && tabStyles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/* -------------------------
   Date Helpers
   ------------------------- */
function formatDateLong(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeOrDefault(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* -------------------------
   Styles
   ------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Wave Header */
  waveWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 360,
    top: -20,
    zIndex: 10,
  },
  waveContent: {
    paddingHorizontal: 20,
  },
  routeCityMain: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  routeAirport: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  headerPrice: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },

  /* Content */
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Tariffs */
  tariffsWrapper: {
    marginVertical: 8,
  },
  tariffTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
    paddingHorizontal: 16,
  },
  tariffCard: {
    width: 260,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tariffCardActive: {
    borderColor: '#0277bd',
    backgroundColor: '#eaf6ff',
  },
  tariffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tariffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  tariffPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0277bd',
  },
  tariffFeatures: {
    marginTop: 10,
  },
  tariffFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tariffFeatureText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#444',
    flexShrink: 1,
  },

  /* Tabs */
  tabsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '90%',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  /* Info Card */
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  airlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  airlineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  flightNumber: {
    fontSize: 13,
    color: '#666',
  },
  routeDetails: {
    marginBottom: 12,
  },
  routeItem: {
    marginBottom: 12,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  routeDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  fareDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  /* Detail Grid */
  detailGrid: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
  },

  /* Button */
  selectSeatsButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  selectSeatsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

/* -------------------------
   Tab Styles
   ------------------------- */
const tabStyles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0277bd',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0277bd',
    fontWeight: '700',
  },
});
