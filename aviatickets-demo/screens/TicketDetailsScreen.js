// screens/TicketDetailsScreen.js
import React, { useState } from 'react';
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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function TicketDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { order } = route.params || {};
  const [loading, setLoading] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Билет не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    flight = {},
    passengers = [],
    orderId = '',
  } = order;

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

  const generatePDF = async () => {
    try {
      setLoading(true);

      const passengersHtml =
        passengers.length > 0
          ? passengers
              .map(
                (p) =>
                  `${p.lastName || ''} ${p.firstName || ''}`.trim()
              )
              .join('<br/>')
          : '—';

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body {
  background: #f2f4f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  padding: 24px;
}
.ticket {
  background: #fff;
  border-radius: 18px;
  max-width: 420px;
  margin: auto;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.top { padding: 20px; }
.brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand-name {
  font-weight: 800;
  font-size: 18px;
  color: #0277bd;
}
.etype {
  font-size: 12px;
  letter-spacing: 1px;
  color: #999;
}
.route {
  margin-top: 18px;
  text-align: center;
}
.cities {
  font-size: 22px;
  font-weight: 800;
  color: #111;
}
.arrow {
  margin: 6px 0;
  font-size: 18px;
  color: #0277bd;
}
.date {
  font-size: 13px;
  color: #555;
}
.times {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}
.time-block {
  text-align: center;
  flex: 1;
}
.label {
  font-size: 11px;
  color: #888;
}
.value {
  font-size: 15px;
  font-weight: 700;
  margin-top: 4px;
}
.divider {
  margin: 20px 0;
  border-top: 1px dashed #ddd;
}
.bottom {
  padding: 20px;
  text-align: center;
}
.passenger {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.qr img {
  width: 160px;
  height: 160px;
}
.order {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  font-family: monospace;
}
.footer {
  margin-top: 10px;
  font-size: 11px;
  color: #999;
}
</style>
</head>

<body>
<div class="ticket">
  <div class="top">
    <div class="brand">
      <div class="brand-name">ONELYA AIR</div>
      <div class="etype">E-TICKET</div>
    </div>

    <div class="route">
      <div class="cities">
        ${flight.from || '—'} → ${flight.to || '—'}
      </div>
      <div class="arrow">✈︎</div>
      <div class="date">${formatDate(flight.date)}</div>
    </div>

    <div class="times">
      <div class="time-block">
        <div class="label">DEPART</div>
        <div class="value">${flight.departTime || '—'}</div>
      </div>
      <div class="time-block">
        <div class="label">ARRIVE</div>
        <div class="value">${flight.arriveTime || '—'}</div>
      </div>
      <div class="time-block">
        <div class="label">CLASS</div>
        <div class="value">${flight.cabinClass || 'Economy'}</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="bottom">
    <div class="passenger">${passengersHtml}</div>

    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${orderId}" />
    </div>

    <div class="order">
      ORDER #${orderId.slice(0, 10).toUpperCase()}
    </div>

    <div class="footer">
      Show this ticket at the boarding gate
    </div>
  </div>
</div>
</body>
</html>
`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось создать PDF');
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity
          style={styles.button}
          onPress={generatePDF}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Открыть PDF билет</Text>
          )}
        </TouchableOpacity>
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