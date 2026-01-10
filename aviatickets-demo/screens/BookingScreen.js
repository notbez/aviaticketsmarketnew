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
import { Modal } from 'react-native';

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


const formatBirthDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(
    d.getMonth() + 1
  ).padStart(2, '0')}.${d.getFullYear()}`;
};

const formatExpiryDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

const formatName = (p) =>
  [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');

/* ================= SCREEN ================= */

export default function BookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { flight, flightView, passengers, contactInfo } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [passengersVisible, setPassengersVisible] = useState(false);

  /* ===== SAFE VIEW (ТОЛЬКО ДЛЯ UI) ===== */
const view = flightView ?? {
  type: flight?.inbound ? 'roundtrip' : 'oneway',

  from: flight?.from,
  to: flight?.to,

  departureAt: flight?.outbound?.departTime,
  arrivalAt: flight?.outbound?.arrivalTime,

  outbound: flight?.outbound
    ? {
        from: flight.from,
        to: flight.to,
        departAt: flight.outbound.departTime,
        arriveAt: flight.outbound.arrivalTime,
        duration: calcDuration(
          flight.outbound.departTime,
          flight.outbound.arrivalTime,
        ),
      }
    : null,

  inbound: flight?.inbound
    ? {
        from: flight.to,
        to: flight.from,
        departAt: flight.inbound.departTime,
        arriveAt: flight.inbound.arrivalTime,
        duration: calcDuration(
          flight.inbound.departTime,
          flight.inbound.arrivalTime,
        ),
      }
    : null,

  cabinClass: flight?.cabinClass,
  fareTitle: flight?.fareTitle,
  price: flight?.price,
};

  /* ===== FLIGHT DTO (НЕ МЕНЯЕМ ЛОГИКУ) ===== */
  const flightDTO = useMemo(() => {
    if (!flight) return null;
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
      brandId: flight.brandId,
    };
  }, [flight]);

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

      const response = await api('/booking/create', {
        method: 'POST',
        body: JSON.stringify({
          offerId: flightDTO.offerId,
          brandId: flightDTO.brandId,
          passengers,
          contact: contactInfo,
          flightView: view,
        }),
      });

      const booking = response?.booking || response;

      if (!booking?._id) {
        throw new Error('Booking ID not returned');
      }

      navigation.navigate('Payment', {
        bookingId: booking._id,
        amount: booking.payment.amount,
        currency: booking.payment?.currency ?? '₽',
        flightView: view,
      });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER — НЕ ТРОГАЕМ */}
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
  {flight?.inbound
    ? `${view.from || '-'} → ${view.to || '-'} → ${view.from || '-'}`
    : `${view.from || '-'} → ${view.to || '-'}`}
</Text>

          <Text style={styles.date}>
            {formatDate(view.departureAt)}
          </Text>

          {/* ===== TIME ===== */}
{flight?.outbound && (
  <>
    <View style={styles.segmentHeader}>
      <Text style={styles.segmentTitle}>Туда</Text>
    </View>

    <View style={styles.timeRow}>
      <View style={styles.timeCol}>
        <Text style={styles.timeLabel}>Вылет</Text>
        <Text style={styles.timeValue}>
          {formatTime(flight.outbound.departTime)}
        </Text>
      </View>

      <MaterialIcons name="schedule" size={20} color="#0277bd" />

      <View style={styles.timeCol}>
        <Text style={styles.timeLabel}>Прилёт</Text>
        <Text style={styles.timeValue}>
          {formatTime(flight.outbound.arrivalTime)}
        </Text>
      </View>
    </View>

    {calcDuration(
      flight.outbound.departTime,
      flight.outbound.arrivalTime
    ) && (
      <View style={styles.durationRow}>
        <MaterialIcons name="timelapse" size={18} color="#666" />
        <Text style={styles.durationText}>
          В пути:{" "}
          {calcDuration(
            flight.outbound.departTime,
            flight.outbound.arrivalTime
          )}
        </Text>
      </View>
    )}
  </>
)}

{flight?.inbound && (
  <>
    <View style={[styles.segmentHeader, { marginTop: 14 }]}>
      <Text style={styles.segmentTitle}>Обратно</Text>
    </View>

    <View style={styles.timeRow}>
      <View style={styles.timeCol}>
        <Text style={styles.timeLabel}>Вылет</Text>
        <Text style={styles.timeValue}>
          {formatTime(flight.inbound.departTime)}
        </Text>
      </View>

      <MaterialIcons name="schedule" size={20} color="#0277bd" />

      <View style={styles.timeCol}>
        <Text style={styles.timeLabel}>Прилёт</Text>
        <Text style={styles.timeValue}>
          {formatTime(flight.inbound.arrivalTime)}
        </Text>
      </View>
    </View>

    {calcDuration(
      flight.inbound.departTime,
      flight.inbound.arrivalTime
    ) && (
      <View style={styles.durationRow}>
        <MaterialIcons name="timelapse" size={18} color="#666" />
        <Text style={styles.durationText}>
          В пути:{" "}
          {calcDuration(
            flight.inbound.departTime,
            flight.inbound.arrivalTime
          )}
        </Text>
      </View>
    )}
  </>
)}

          <View style={styles.divider} />

          <Text style={styles.cabin}>
            {[view.cabinClass, view.fareTitle].filter(Boolean).join(' · ')}
          </Text>
        </View>

        {/* PASSENGERS */}
        <TouchableOpacity
  style={styles.card}
  activeOpacity={0.85}
  onPress={() => setPassengersVisible(true)}
>
  <View style={styles.passengersRow}>
    <View>
      <Text style={styles.cardTitle}>Пассажиры</Text>
      <Text style={styles.simpleText}>
        {passengers?.length || 0} чел.
      </Text>
    </View>

    <MaterialIcons
      name="chevron-right"
      size={26}
      color="#0277bd"
    />
  </View>
</TouchableOpacity>

        {/* PRICE */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Итого к оплате</Text>
          <Text style={styles.priceValue}>
            ≈ {(Number(view.price) || 0) * (passengers?.length || 1)} ₽
          </Text>
        </View>

        {/* CONFIRM */}
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={book}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Подтвердить бронирование</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Modal
  visible={passengersVisible}
  transparent
  animationType="fade"
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setPassengersVisible(false)}
  >
    <TouchableOpacity
      activeOpacity={1}
      style={styles.modalCard}
    >
      <Text style={styles.modalTitle}>Данные пассажиров</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {passengers?.map((p, i) => (
          <View key={i} style={styles.passengerItem}>
  <Text style={styles.passengerName}>
    {formatName(p)}
  </Text>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Пол</Text>
    <Text style={styles.infoValue}>
      {p.gender === 'M' ? 'Мужской' : 'Женский'}
    </Text>
  </View>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Дата рождения</Text>
    <Text style={styles.infoValue}>
      {formatBirthDate(p.birthDate || p.dateOfBirth)}
    </Text>
  </View>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Номер документа</Text>
    <Text style={styles.infoValue}>
      {p.passportNumber || p.document}
    </Text>
  </View>

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Срок действия</Text>
    <Text style={styles.infoValue}>
      {formatExpiryDate(p.passportExpiryDate)}
    </Text>
  </View>
</View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.modalCloseBtn}
        onPress={() => setPassengersVisible(false)}
      >
        <Text style={styles.modalCloseText}>Закрыть</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>
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
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 10,
  },

  durationText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#555',
  },

  divider: {
    height: 1,
    backgroundColor: '#dbe9f6',
    marginVertical: 14,
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
    marginBottom: 6,
  },

  simpleText: {
    fontSize: 15,
    fontWeight: '600',
  },

  priceCard: {
    backgroundColor: '#f5f8fb',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
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

  passengersRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalCard: {
  width: '88%',
  maxHeight: '80%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 18,
},

modalTitle: {
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 12,
},

passengerItem: {
  backgroundColor: '#f5f8fb',
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
},

passengerItem: {
  backgroundColor: '#f5f8fb',
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
},

passengerName: {
  fontSize: 17,
  fontWeight: '700',
  marginBottom: 10,
  color: '#111',
},

infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 6,
  borderBottomWidth: 1,
  borderBottomColor: '#e6edf5',
},

infoLabel: {
  fontSize: 13,
  color: '#7a8896',
},

infoValue: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111',
},

modalCloseBtn: {
  marginTop: 10,
  paddingVertical: 14,
  borderRadius: 14,
  backgroundColor: '#0277bd',
  alignItems: 'center',
},

modalCloseText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '700',
},

segmentHeader: {
  marginTop: 12,
  marginBottom: 6,
},

segmentTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#0277bd',
},
});