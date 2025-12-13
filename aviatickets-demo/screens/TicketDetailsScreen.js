import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../lib/api';
import * as Linking from 'expo-linking';

export default function TicketDetailsScreen() {
  const route = useRoute();
  const { order } = route.params;
  const [loading, setLoading] = useState(false);

  const handleBlank = () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/onelya/order/reservation/blank`;
  
    Linking.openURL(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        OrderId: order.OrderId,
      }),
    });
  };

  const routeInfo = order.Routes?.[0];
  const segment = routeInfo?.Segments?.[0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Детали билета</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Маршрут</Text>
        <Text style={styles.value}>
          {segment?.Departure?.Airport} → {segment?.Arrival?.Airport}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Статус</Text>
        <Text style={styles.value}>{order.Status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Пассажиры</Text>
        {order.Customers?.map((c, i) => (
          <Text key={i} style={styles.value}>
            {c.LastName} {c.FirstName}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleBlank}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Показать билет</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  button: {
    backgroundColor: '#0277bd',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});