// screens/TicketDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../lib/api';
import { API_URL } from '../config';

export default function TicketDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

const { bookingId } = route.params;
const [booking, setBooking] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const data = await api(`/booking/${bookingId}`);
      setBooking(data);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить билет');
    } finally {
      setLoading(false);
    }
  };
  load();
}, [bookingId]);

if (loading) {
  return <ActivityIndicator />;
}

if (!booking) {
  return <Text>Билет не найден</Text>;
}


  const flight = {
  from: booking.from,
  to: booking.to,
  date: booking.departureDate,
  departTime: booking.departTime,
  arriveTime: booking.arriveTime,
  cabinClass: booking.cabinClass,
};
const passengers = booking?.passengers || [];

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  
  const openBlank = async () => {
  const url = `${API_URL}/booking/${bookingId}/blank/file`;
  await Linking.openURL(url);
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Билет</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ROUTE CARD */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Text style={styles.city}>{flight.from}</Text>
            <MaterialIcons name="flight" size={20} color="#0277bd" />
            <Text style={styles.city}>{flight.to}</Text>
          </View>

          <Text style={styles.date}>{formatDate(flight.date)}</Text>

          <View style={styles.timeRow}>
            <View>
              <Text style={styles.label}>Вылет</Text>
              <Text style={styles.value}>{flight.departTime || '—'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Прилёт</Text>
              <Text style={styles.value}>{flight.arriveTime || '—'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Класс</Text>
              <Text style={styles.value}>{flight.cabinClass || 'Economy'}</Text>
            </View>
          </View>
        </View>

        {/* PASSENGERS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Пассажиры</Text>
          {passengers.map((p, i) => (
            <View key={i} style={styles.passengerRow}>
              <MaterialIcons name="person" size={18} color="#0277bd" />
              <Text style={styles.passengerName}>
                {p.lastName} {p.firstName}
              </Text>
            </View>
          ))}
        </View>

        {/* BUTTON */}
{booking.bookingStatus === 'ticketed' ? (
  <TouchableOpacity onPress={openBlank}>
    <Text>Открыть билет (PDF)</Text>
  </TouchableOpacity>
) : (
  <Text style={{ color: '#999', marginTop: 12 }}>
    Билет будет доступен после подтверждения
  </Text>
)}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  routeCard: {
    backgroundColor: '#eaf6ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  city: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  date: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengerName: {
    marginLeft: 8,
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: '#777',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  valueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  button: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});