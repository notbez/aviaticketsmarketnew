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
import { normalizeFlightView } from '../utils/normalizeFlightView';
import { getFlightView } from '../stores/FlightViewStore';

/**
 * User tickets screen displaying booked flights and travel history
 * Shows flight details with departure/arrival times and booking status
 * TODO: Add ticket filtering by status (active, completed, cancelled)
 * TODO: Implement ticket sharing and export functionality
 * TODO: Add offline ticket storage for no-network access
 */
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

  /**
   * Load user bookings with flight details enrichment
   */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api('/booking');

      const enriched = await Promise.all(
        (data || []).map(async (b) => {
          try {
            const full = await api(`/booking/${b._id}`);

            return {
              orderId: b._id,
              bookingStatus: b.bookingStatus,
              flightView: getFlightView(b._id) || full.flightView,
            };
          } catch {
            return {
              orderId: b._id,
              bookingStatus: b.bookingStatus,
              flightView: null,
            };
          }
        })
      );

      setOrders(enriched);
    } catch (e) {
      console.error('Load bookings error:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render individual ticket card with flight information
   */
  const renderOrder = (order) => {
    const fv = normalizeFlightView(order.flightView);

    return (
      <View key={order.orderId} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.airlineIcon}>
            <MaterialIcons name="flight" size={22} color="#0277bd" />
          </View>
          <View>
            <Text style={styles.airlineName}>ONELYA AIR</Text>
            <Text style={styles.orderId}>
              Заказ № {order.orderId.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View style={styles.route}>
          <View style={styles.cityBlock}>
            <Text style={styles.time}>
              {fv?.outbound?.departAt
                ? new Date(fv.outbound.departAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </Text>
            <Text style={styles.city}>{fv?.from || '—'}</Text>
          </View>

          <View style={styles.middle}>
            <MaterialIcons name="flight" size={16} color="#0277bd" />
            <View style={styles.line} />
            <Text style={styles.duration}>В пути</Text>
          </View>

          <View style={styles.cityBlock}>
            <Text style={styles.time}>
              {fv?.outbound?.arriveAt
                ? new Date(fv.outbound.arriveAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </Text>
            <Text style={styles.city}>{fv?.to || '—'}</Text>
          </View>
        </View>

        {fv?.inbound && (
          <View style={styles.route}>
            <View style={styles.cityBlock}>
              <Text style={styles.time}>
                {fv.inbound.departAt
                  ? new Date(fv.inbound.departAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </Text>
              <Text style={styles.city}>{fv?.to || '—'}</Text>
            </View>

            <View style={styles.middle}>
              <MaterialIcons name="flight" size={16} color="#0277bd" />
              <View style={styles.line} />
              <Text style={styles.duration}>В пути</Text>
            </View>

            <View style={styles.cityBlock}>
              <Text style={styles.time}>
                {fv.inbound.arriveAt
                  ? new Date(fv.inbound.arriveAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </Text>
              <Text style={styles.city}>{fv?.from || '—'}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('TicketDetails', {
              bookingId: order.orderId,
            })
          }
        >
          <Text style={styles.primaryText}>Открыть билет</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Мои билеты</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0277bd" />
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="flight" size={72} color="#cfd8dc" />
            <Text style={styles.emptyTitle}>Билетов пока нет</Text>
            <Text style={styles.emptyText}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },

  content: {
    padding: 20,
    paddingBottom: 80,
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  airlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  airlineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  orderId: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  cityBlock: {
    alignItems: 'center',
    width: 80,
  },

  time: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  city: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  middle: {
    alignItems: 'center',
    flex: 1,
  },

  line: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 6,
  },

  duration: {
    fontSize: 12,
    color: '#777',
  },

  primaryBtn: {
    backgroundColor: '#0277bd',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  empty: {
    alignItems: 'center',
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    color: '#111',
  },

  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});