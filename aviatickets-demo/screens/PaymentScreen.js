import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { orderId, amount, currency = '₽' } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!token) {
      Alert.alert('Ошибка', 'Необходима авторизация');
      return;
    }

    if (!orderId) {
      Alert.alert('Ошибка', 'Отсутствует идентификатор бронирования');
      return;
    }

    try {
      setLoading(true);

      // 🔹 Эмуляция успешной внешней оплаты
      // Здесь позже можно подключить реальную платёжку

      const json = await api('/onelya/order/reservation/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          paymentMethod: 'Cashless',
        }),
      });

      console.log('Reservation/Confirm response:', json);

      if (!json?.OrderId) {
        Alert.alert('Ошибка оплаты', 'Бронирование не подтверждено');
        return;
      }

      Alert.alert(
        'Успешно!',
        'Оплата прошла успешно. Билет оформлен.',
        [
          {
            text: 'Перейти к билетам',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'MainTabs', params: { screen: 'Tickets' } },
                ],
              }),
          },
        ]
      );
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Ошибка', err.message || 'Ошибка при оплате');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Оплата</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Сумма к оплате</Text>
          <Text style={styles.amount}>
            {(amount || 0).toLocaleString('ru-RU')} {currency}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          <TouchableOpacity style={styles.paymentMethod}>
            <Text style={styles.methodText}>💳 Банковская карта</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Оплатить</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#0277bd',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0277bd',
  },
  paymentMethod: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  methodText: {
    fontSize: 16,
    color: '#111',
  },
  payButton: {
    backgroundColor: '#0277bd',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});