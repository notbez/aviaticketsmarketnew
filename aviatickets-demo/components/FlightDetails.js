import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Easing
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function FlightDetails({ route, navigation, flight: flightProp, onClose }) {
  const flight = flightProp || route?.params?.flight;
  if (!flight) return null;

  const fares = Array.isArray(flight.fares) ? flight.fares : [];
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('info');
  const [closing, setClosing] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  React.useEffect(() => {

Animated.spring(translateY, {
  toValue: 0,
  damping: 18,
  stiffness: 160,
  mass: 0.9,
  useNativeDriver: true,
}).start();
}, []);

  const baseFare = fares[0];
  const selectedFare = fares[selectedFareIndex];


const closeSheet = () => {
  if (closing) return;
setClosing(true);

Animated.timing(translateY, {
  toValue: SHEET_HEIGHT,
  duration: 240,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
}).start(() => {
  onClose?.();
});
};

  /* ================= swipe down ================= */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
  closeSheet();
} else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /* ================= helpers ================= */

  const formatPrice = (v) =>
    v == null ? '-' : Number(v).toLocaleString('ru-RU') + ' ₽';

  const safe = (v) =>
  v === null || v === undefined || v === '' ? '-' : String(v);

const priceDiff = (fare) => {
  if (!baseFare || fare?.amount == null) return null;
  const diff = fare.amount - baseFare.amount;
  return diff > 0 ? `+${formatPrice(diff)}` : null;
};

  /* ================= render ================= */

  return (
    <Animated.View
  style={[
    styles.sheet,
    { transform: [{ translateY }] },
  ]}
>
      {/* ===== GRABBER ===== */}

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
            <TouchableOpacity
  onPress={closeSheet}
  style={{
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  }}
>
  <MaterialCommunityIcons
    name="close"
    size={26}
    color="#333"
  />
</TouchableOpacity>
        <Text style={styles.routeMain}>
          {flight.from} → {flight.to}
        </Text>
        <Text style={styles.headerPrice}>
          {formatPrice(selectedFare?.amount ?? flight.price)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
       {/* ===== TARIFFS ===== */}
        {fares.length > 0 && (
          <View style={styles.tariffsWrapper}>
            <Text style={styles.sectionTitle}>Выберите тариф</Text>

            {fares.map((fare, index) => {
              const active = index === selectedFareIndex;
              const diff = priceDiff(fare);
              const recommended = index === 1 || fares.length === 1;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => setSelectedFareIndex(index)}
                  style={[
                    styles.fareRow,
                    active && styles.fareRowActive,
                  ]}
                >
                  {/* LEFT */}
                  <View style={styles.fareLeft}>
                    <View
                      style={[
                        styles.radioOuter,
                        active && styles.radioOuterActive,
                      ]}
                    >
                      {active && <View style={styles.radioInner} />}
                    </View>

                    <View style={styles.fareText}>
                      <View style={styles.fareTitleRow}>
                        <Text style={styles.fareTitle}>
                          {safe(fare.title)}
                        </Text>

                        {recommended && (
                          <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>
                              Рекомендуем
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.baggageRow}>
                        <MaterialCommunityIcons
                          name="bag-checked"
                          size={14}
                          color="#666"
                        />
                        <Text
                          style={styles.fareSubtitle}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {safe(fare.baggage || 'Без багажа')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* RIGHT */}
                  <View style={styles.fareRight}>
                    <Text style={styles.farePrice}>
                      {formatPrice(fare.amount)}
                    </Text>
                    {diff && (
                      <Text style={styles.priceDiff}>
                        {diff}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ===== TABS ===== */}
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

        {/* ===== INFO ===== */}
        {activeTab === 'info' && selectedFare && (
          <View style={styles.infoCard}>
            <DetailRow label="Багаж" value={safe(selectedFare.baggage)} />
            <DetailRow label="Ручная кладь" value={safe(selectedFare.carryOn)} />
            <DetailRow label="Питание" value={safe(selectedFare.meal)} />
            <DetailRow label="Обмен" value={safe(selectedFare.exchange)} />
            <DetailRow label="Возврат" value={safe(selectedFare.refund)} />
          </View>
        )}

        {/* ===== RULES ===== */}
        {activeTab === 'rules' && (
          <View style={styles.infoCard}>
            <Text style={styles.rulesText}>
              {safe(selectedFare?.refund)}
            </Text>
            <Text style={[styles.rulesText, { marginTop: 8 }]}>
              {safe(selectedFare?.exchange)}
            </Text>
          </View>
        )}

        {/* ===== CONTINUE ===== */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            onClose?.();
            requestAnimationFrame(() => {
              navigation.navigate('PassengerInfo', {
                flight: {
                  ...flight,
                  price: selectedFare?.amount,
                },
                offerId: flight.offerId,
                selectedBrandId: selectedFare?.brandId,
              });
            });
          }}
        >
          <Text style={styles.continueText}>Продолжить</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

function TabButton({ title, active, onPress }) {
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




/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  grabberWrapper: { paddingTop: 8, paddingBottom: 12, alignItems: 'center' },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#ccc' },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  routeMain: { fontSize: 18, fontWeight: '700' },
  headerPrice: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: '#0277bd',
  },

  content: { padding: 16, paddingBottom: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  tariffsWrapper: { marginBottom: 16 },

  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  fareRowActive: {
    borderColor: '#0277bd',
    backgroundColor: '#f2f8ff',
  },

  fareLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 12,
  },

  fareText: { flex: 1 },

  fareRight: {
    width: 90,
    alignItems: 'flex-end',
  },

  fareTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  fareTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
    flexShrink: 1,
  },

  fareSubtitle: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    flexShrink: 1,
  },

  farePrice: { fontSize: 16, fontWeight: '800', color: '#0277bd' },

  priceDiff: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 2,
  },

  recommendedBadge: {
    backgroundColor: '#e8f4ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    color: '#0277bd',
    fontWeight: '700',
  },

  baggageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: '#0277bd' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0277bd',
  },

  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: { color: '#666', width: '45%' },
  detailValue: {
    fontWeight: '600',
    width: '55%',
    textAlign: 'right',
  },

  rulesText: { fontSize: 13, color: '#555', lineHeight: 18 },

  continueButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sheet: {
  position: 'absolute',
  bottom: 0,
  height: SHEET_HEIGHT,
  width: '100%',
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: 'hidden',
},
});

const tabStyles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#0277bd' },
  tabText: { fontSize: 14, color: '#999' },
  tabTextActive: { color: '#0277bd', fontWeight: '700' },
});