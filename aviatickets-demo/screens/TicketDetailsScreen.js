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
} from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../lib/api';
import { API_URL } from '../config';
import * as WebBrowser from 'expo-web-browser';

export default function TicketDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { bookingId, flightView: flightViewFromRoute } = route.params;
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
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return <Text>Билет не найден</Text>;
  }

  const fv =
  booking?.flightView ??
  flightViewFromRoute;

  if (!fv) {
  return (
    <SafeAreaView style={styles.center}>
      <Text>Данные рейса недоступны</Text>
    </SafeAreaView>
  );
}

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
  try {
    // 1️⃣ Гарантируем, что blank создан
    const { accessToken } = await api(
      `/booking/${bookingId}/blank`,
      {
        method: 'POST',
        body: {}, // ← КРИТИЧНО
      },
    );

    // 2️⃣ Открываем публичную ссылку
    const url =
      `${API_URL}/booking/${bookingId}/blank/file` +
      `?token=${accessToken}`;

    await WebBrowser.openBrowserAsync(url, {
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      controlsColor: '#0277bd',
    });
  } catch (e) {
    console.error('[Ticket] openBlank error', e);
    Alert.alert('Ошибка', 'Не удалось открыть билет');
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Электронный билет</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ROUTE */}
        <View style={styles.routeCard}>
          <Text style={styles.route}>
  {fv.type === 'roundtrip'
    ? `${fv.from} → ${fv.to} → ${fv.from}`
    : `${fv.from} → ${fv.to}`}
</Text>

<Text style={styles.date}>
  {formatDate(fv?.outbound?.departAt)}
</Text>
{fv.outbound && (
  <>
    <View style={styles.segmentHeader}>
      <Text style={styles.segmentTitle}>Туда</Text>
    </View>

    <View style={styles.timeRow}>
      <View>
        <Text style={styles.label}>Вылет</Text>
        <Text style={styles.value}>
          {new Date(fv.outbound.departAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View>
        <Text style={styles.label}>Прилёт</Text>
        <Text style={styles.value}>
          {new Date(fv.outbound.arriveAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  </>
)}
{fv.inbound && (
  <>
    <View style={[styles.segmentHeader, { marginTop: 12 }]}>
      <Text style={styles.segmentTitle}>Обратно</Text>
    </View>

    <View style={styles.timeRow}>
      <View>
        <Text style={styles.label}>Вылет</Text>
        <Text style={styles.value}>
          {new Date(fv.inbound.departAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View>
        <Text style={styles.label}>Прилёт</Text>
        <Text style={styles.value}>
          {new Date(fv.inbound.arriveAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  </>
)}
        </View>

        {/* PASSENGERS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Пассажиры</Text>
          {passengers.map((p, i) => (
            <View key={i} style={styles.passengerRow}>
              <MaterialIcons
                name="person"
                size={18}
                color="#0277bd"
              />
              <Text style={styles.passengerName}>
                {p.lastName} {p.firstName}
              </Text>
            </View>
          ))}
        </View>

        {/* ACTIONS */}
        {booking.bookingStatus === 'ticketed' ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={openBlank}
          >
            <MaterialIcons
              name="picture-as-pdf"
              size={20}
              color="#fff"
            />
            <Text style={styles.primaryButtonText}>
              Открыть билет (PDF)
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.pending}>
            Билет будет доступен после подтверждения
          </Text>
        )}

        {/* SECONDARY ACTION */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Tickets',
            })
          }
        >
          <View style={styles.secondaryIcon}>
            <MaterialIcons
              name="list-alt"
              size={18}
              color="#0277bd"
            />
          </View>
          <Text style={styles.secondaryText}>Мои билеты</Text>
          <MaterialIcons
            name="chevron-right"
            size={22}
            color="#0277bd"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
    paddingBottom: 40,
  },

  routeCard: {
    backgroundColor: '#f2f8ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  route: {
    fontSize: 20,
    fontWeight: '800',
  },

  date: {
    marginTop: 6,
    color: '#555',
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  label: {
    fontSize: 12,
    color: '#777',
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
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
    fontWeight: '500',
  },

  primaryButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },

  secondaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  secondaryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0277bd',
  },

  pending: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
  },
});