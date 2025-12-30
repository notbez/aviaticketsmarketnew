// screens/PaymentScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../lib/api';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {
    bookingId,
    amount = 0,
    currency = '₽',
    flightView,
  } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 2. Virtual pay
      await api(`/booking/${bookingId}/pay`, { method: 'POST' });

      // 3. Confirm (создаёт билет)
      await api(`/booking/${bookingId}/confirm`, { method: 'POST' });

      // 4. Всегда переходим к билету
      navigation.replace('TicketDetails', {
        bookingId,
        flightView, // ✅ КРИТИЧЕСКИ ВАЖНО
      });
    } catch (e) {
      Alert.alert(
        'Ошибка оплаты',
        e.message || 'Не удалось завершить оплату',
      );
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
        <Text style={styles.headerTitle}>Оплата</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            Итого к оплате
          </Text>
          <Text style={styles.amountValue}>
            {Number(amount).toLocaleString('ru-RU')} {currency}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            loading && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Оплатить
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom }} />
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
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },

  amountCard: {
    backgroundColor: '#f2f8ff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },

  amountLabel: {
    fontSize: 14,
    color: '#666',
  },

  amountValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0277bd',
    marginTop: 8,
  },

  payButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },

  payButtonDisabled: {
    opacity: 0.6,
  },

  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});