// screens/TicketsScreen.js
import React, { useState, useEffect } from 'react';
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
    if (token) loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api('/onelya/order/info/order-list', {
        method: 'POST',
        body: JSON.stringify({ Date: new Date().toISOString().slice(0, 10) })
        });
      setOrders(data?.Orders || []);
    } catch (e) {
      console.error('OrderList error', e);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = (order) => {
    const route = order.Routes?.[0];
    const segment = route?.Segments?.[0];

    return (
      <View key={order.OrderId} style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.airlineLogo}>
            <Text style={styles.airlineLogoText}>
              {segment?.MarketingAirline?.Code || '✈️'}
            </Text>
          </View>
          <View>
            <Text style={styles.airlineName}>
              {segment?.MarketingAirline?.Name || 'Авиакомпания'}
            </Text>
            <Text style={styles.flightNumber}>
              Order #{order.OrderId}
            </Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{segment?.Departure?.Time}</Text>
            <Text style={styles.cityCode}>{segment?.Departure?.Airport}</Text>
          </View>

          <View style={styles.durationBlock}>
            <MaterialIcons name="flight" size={16} color="#666" />
            <Text style={styles.durationText}>
              {order.Status}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.time}>{segment?.Arrival?.Time}</Text>
            <Text style={styles.cityCode}>{segment?.Arrival?.Airport}</Text>
          </View>
        </View>

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
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
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
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  cardHeaderContent: {
    flex: 1,
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
