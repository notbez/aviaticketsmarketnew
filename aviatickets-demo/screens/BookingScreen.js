// screens/BookingScreen.js
import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

/* ================= HELPERS ================= */

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
};

const formatTime = (iso) => {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calcDuration = (from, to) => {
  if (!from || !to) return null;
  const diff = Math.max(0, new Date(to) - new Date(from));
  const minutes = Math.floor(diff / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} ч ${m} мин`;
};

/* ================= SCREEN ================= */

export default function BookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { flight, flightView, passengers, contactInfo } = route.params || {};
  const [loading, setLoading] = useState(false);

  /* ===== FLIGHT DTO ===== */
const flightDTO = useMemo(() => {
  return {
    from: flight.from,
    to: flight.to,

    departureAt: flight.departureAt,
    arrivalAt: flight.arrivalAt,

    duration: calcDuration(
      flight.departureAt,
      flight.arrivalAt
    ),

    cabinClass: flight.cabinClass || 'Эконом',
    fareTitle: flight.selectedFareTitle,

    price: flight.price,
    offerId: flight.offerId,
    selectedFareCode: flight.selectedFareCode,
  };
}, [flight]);

console.log(
  '[BOOKING] flight',
  flight.departureAt,
  flight.arrivalAt
);

console.log('[BOOKING flightView]', flightView);

  if (!flightDTO) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text>Данные рейса отсутствуют</Text>
      </SafeAreaView>
    );
  }

  const book = async () => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходима авторизация');
      return;
    }

    if (!flightDTO.offerId) {
      Alert.alert('Ошибка', 'Отсутствует offerId');
      return;
    }

    try {
      setLoading(true);

      console.log(
  '[BookingScreen] sending brandId =',
  flight?.brandId
);

      const response = await api('/booking/create', {
        method: 'POST',
        body: JSON.stringify({
          offerId: flightDTO.offerId,
          brandId: flight.brandId,   // ✅ ВОТ ОН
          passengers,
          contact: contactInfo,
        }),
      });

      const booking = response?.booking ?? response;

      if (!booking?._id) {
        throw new Error('Booking ID not returned');
      }

      navigation.navigate('Payment', {
        bookingId: booking._id,
        amount: booking.payment?.amount ?? flightView.price,
        currency: booking.payment?.currency ?? '₽',
        flightView, // ✅ ВАЖНО
      });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подтверждение</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== FLIGHT CARD ===== */}
        <View style={styles.flightCard}>
          <Text style={styles.route}>
            {flightView?.from} → {flightView?.to}
          </Text>

          <Text style={styles.date}>
            {formatDate(flightView?.departureAt)}
          </Text>

          {/* TIME ROW */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Вылет</Text>
              <Text style={styles.timeValue}>
                {formatTime(flightView?.departureAt)}
              </Text>
            </View>

            <MaterialIcons
              name="schedule"
              size={20}
              color="#0277bd"
            />

            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Прилёт</Text>
              <Text style={styles.timeValue}>
                {formatTime(flightView?.arrivalAt)}
              </Text>
            </View>
          </View>

          {flightDTO.duration && (
            <View style={styles.durationRow}>
              <MaterialIcons
                name="timelapse"
                size={18}
                color="#555"
              />
              <Text style={styles.durationText}>
                В пути: {flightDTO.duration}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.cabin}>
            {[flightView?.cabinClass, flightView?.fareTitle]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>

        {/* PASSENGERS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Пассажиры</Text>
          <Text style={styles.simpleText}>
            {passengers.length} чел.
          </Text>
        </View>

        {/* PRICE */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Итого к оплате</Text>
          <Text style={styles.priceValue}>
            {Number(flightView?.price || 0).toLocaleString('ru-RU')} ₽
          </Text>
        </View>

        {/* CONFIRM */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            loading && styles.confirmBtnDisabled,
          ]}
          onPress={book}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>
              Подтвердить бронирование
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  content: {
    padding: 16,
  },

  flightCard: {
    backgroundColor: '#f2f8ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  route: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },

  date: {
    fontSize: 14,
    color: '#555',
  },

  timeRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timeCol: {
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: 12,
    color: '#777',
  },

  timeValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  durationText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
  },

  divider: {
    height: 1,
    backgroundColor: '#dbe9f6',
    marginVertical: 12,
  },

  cabin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0277bd',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },

  simpleText: {
    fontSize: 15,
    fontWeight: '600',
  },

  priceCard: {
    backgroundColor: '#f5f8fb',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  priceLabel: {
    fontSize: 14,
    color: '#555',
  },

  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0277bd',
    marginTop: 6,
  },

  confirmBtn: {
    backgroundColor: '#0277bd',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },

  confirmBtnDisabled: { opacity: 0.6 },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});