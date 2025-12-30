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
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function FlightDetails({ route, navigation, flight: flightProp, onClose }) {
  const flight = flightProp || route?.params?.flight;
  if (!flight) return null;

  /* ================= LOAD FARES (НЕ ТРОГАЕМ) ================= */

  const [fares, setFares] = useState([]);
  const [loadingFares, setLoadingFares] = useState(true);

  const { token } = useAuth();

  React.useEffect(() => {
    let cancelled = false;

    async function loadBrandFares() {
      try {
        setLoadingFares(true);

        const res = await fetch(`${API_URL}/flights/brand-fares`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: flight.offerId }),
        });

        const data = await res.json();
        if (!cancelled) setFares(data || []);
      } catch (e) {
        console.error('Brand fares error', e);
      } finally {
        if (!cancelled) setLoadingFares(false);
      }
    }

    loadBrandFares();
    return () => { cancelled = true; };
  }, [flight.offerId]);

  /* ================= STATE ================= */

  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('info');

  const baseFare = fares[0];
  const selectedFare = fares[selectedFareIndex];

  /* ================= HELPERS ================= */

  const formatPrice = (v) =>
    v == null ? '-' : Number(v).toLocaleString('ru-RU') + ' ₽';

  const safe = (v) =>
    v === null || v === undefined || v === '' ? '-' : String(v);

  const priceDiff = (fare) => {
    if (!baseFare || fare?.amount == null) return null;
    const diff = fare.amount - baseFare.amount;
    return diff > 0 ? `+${formatPrice(diff)}` : null;
  };

  /* ================= RENDER ================= */

  return (
    <View style={styles.sheet}>

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.routeMain}>{flight.from} → {flight.to}</Text>
        <Text style={styles.headerPrice}>
          {formatPrice(selectedFare?.amount ?? flight.price)}
        </Text>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ===== LOADER ===== */}
        {loadingFares && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0277bd" />
            <Text style={styles.loaderText}>Ищем лучшие тарифы…</Text>
          </View>
        )}

        {/* ===== TARIFFS ===== */}
        {!loadingFares && fares.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Выберите тариф</Text>

            {fares.map((fare, index) => {
              const active = index === selectedFareIndex;
              const diff = priceDiff(fare);

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.fareCard, active && styles.fareActive]}
                  activeOpacity={0.9}
                  onPress={() => setSelectedFareIndex(index)}
                >
                  <View style={styles.fareLeft}>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.fareTitle}>{safe(fare.title)}</Text>
                      <Text style={styles.fareSub}>{safe(fare.baggage || 'Без багажа')}</Text>
                    </View>
                  </View>

                  <View style={styles.fareRight}>
                    <Text style={styles.farePrice}>{formatPrice(fare.amount)}</Text>
                    {diff && <Text style={styles.priceDiff}>{diff}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ===== TABS ===== */}
        <View style={styles.tabs}>
          {['info', 'rules'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'info' ? 'Информация' : 'Правила'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== CONTENT ===== */}
        <View style={styles.infoCard}>
          {activeTab === 'info' && (
            <>
              <Row label="Багаж" value={safe(selectedFare?.baggage)} />
              <Row label="Ручная кладь" value={safe(selectedFare?.carryOn)} />
              <Row label="Питание" value={safe(selectedFare?.meal)} />
              <Row label="Обмен" value={safe(selectedFare?.exchange)} />
              <Row label="Возврат" value={safe(selectedFare?.refund)} />
            </>
          )}

          {activeTab === 'rules' && (
            <>
              <Text style={styles.rulesText}>{safe(selectedFare?.refund)}</Text>
              <Text style={styles.rulesText}>{safe(selectedFare?.exchange)}</Text>
            </>
          )}
        </View>

        {/* ===== CONTINUE ===== */}
        <TouchableOpacity
          style={styles.continue}
          onPress={() => {
            onClose?.();
                    
            const payload = {
              flight: {
                ...flight,
                price: selectedFare?.amount,
                offerId: flight.offerId,
                brandId: selectedFare?.brandId,
              },
            
                flightView: {
                  from: flight.from,
                  to: flight.to,
                                
                  // 🔥 ВОТ ОНИ, НАСТОЯЩИЕ ДАТЫ
                  departureAt: flight.departTime,
                  arrivalAt: flight.arrivalTime,
                                
                  cabinClass: flight.cabinClass,
                  fareTitle: selectedFare?.title,
                  price: selectedFare?.amount,
                },
            };
            if (!token) {
              navigation.navigate('Login', {
                returnTo: 'PassengerInfo',
                params: payload,
              });
            } else {
              navigation.navigate('PassengerInfo', payload);
            }
          }}
        >
          <Text style={styles.continueText}>Продолжить</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ================= SMALL ================= */

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    height: SHEET_HEIGHT,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  grabberZone: { padding: 12, alignItems: 'center' },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#ccc' },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  routeMain: { fontSize: 18, fontWeight: '700' },
  headerPrice: { marginTop: 4, fontSize: 20, fontWeight: '800', color: '#0277bd' },
  closeBtn: { position: 'absolute', right: 16, top: 16 },

  content: { padding: 16, paddingBottom: 40 },

  loaderBox: { paddingVertical: 32, alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#666' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  fareCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  fareActive: { borderColor: '#0277bd', backgroundColor: '#f2f8ff' },

  fareLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  fareRight: { alignItems: 'flex-end' },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#0277bd' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0277bd' },

  fareTitle: { fontWeight: '700' },
  fareSub: { fontSize: 13, color: '#666', marginTop: 4 },
  farePrice: { fontSize: 16, fontWeight: '800', color: '#0277bd' },
  priceDiff: { fontSize: 12, color: '#4caf50' },

  tabs: { flexDirection: 'row', marginVertical: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#0277bd' },
  tabText: { color: '#999' },
  tabTextActive: { color: '#0277bd', fontWeight: '700' },

  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: { color: '#666' },
  rowValue: { fontWeight: '600' },

  rulesText: { fontSize: 13, color: '#555', marginBottom: 8 },

  continue: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});