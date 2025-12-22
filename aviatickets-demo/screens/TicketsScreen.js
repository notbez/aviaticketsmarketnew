// screens/TicketsScreen.js
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function TicketsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api('/booking');

      // Приводим backend bookings → UI orders
      const mapped = (data || []).map((b) => ({
        orderId: b._id,
        flight: {
          from: b.from,
          to: b.to,
          date: b.departureDate,
          departTime: b.departTime || '—',
          arriveTime: b.arriveTime || '—',
          airline: b.provider || 'ONELYA AIR',
          cabinClass: b.cabinClass || 'Economy',
          duration: '',
        },
        passengers: b.passengers || [],
        bookingStatus: b.bookingStatus,
      }));

      setOrders(mapped);
    } catch (e) {
      console.error('Load bookings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = (order) => {
    const { flight } = order;
    if (!flight) return null;

    return (
      <View key={order.orderId} style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.airlineLogo}>
            <Text style={styles.airlineLogoText}>
              {flight.airline?.charAt(0) || '✈️'}
            </Text>
          </View>
          <View>
            <Text style={styles.airlineName}>
              {flight.airline || 'Авиакомпания'}
            </Text>
            <Text style={styles.flightNumber}>
              Заказ № {order.orderId.slice(0, 8)}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeInfo}>
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{flight.departTime}</Text>
            <Text style={styles.cityCode}>{flight.from}</Text>
          </View>

          <View style={styles.durationBlock}>
            <MaterialIcons name="flight" size={16} color="#666" />
            <Text style={styles.durationText}>
              {flight.duration || 'В пути'}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.time}>{flight.arriveTime}</Text>
            <Text style={styles.cityCode}>{flight.to}</Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate('TicketDetails', { order })
          }
        >
          <Text style={styles.detailsButtonText}>Подробности</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Мои билеты</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0277bd" />
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="flight" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Билетов пока нет</Text>
            <Text style={styles.emptySubtext}>
              Забронируйте билет — он появится здесь
            </Text>
          </View>
        ) : (
          orders.map(renderOrder)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  airlineLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  airlineLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0277bd',
  },

  airlineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  flightNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  timeBlock: {
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  cityCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  detailsButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});