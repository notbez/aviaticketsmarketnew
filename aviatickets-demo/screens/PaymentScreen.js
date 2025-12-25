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
  const { bookingId, amount = 0, currency = '₽' } =
    route.params || {};
  const [loading, setLoading] = useState(false);

const handlePayment = async () => {
  try {
    setLoading(true);

    // 1. Recalc
    await api(`/booking/${bookingId}/recalc`, { method: 'POST' });

    // 2. Virtual pay
    await api(`/booking/${bookingId}/pay`, { method: 'POST' });

    // 3. Confirm (СОЗДАЁТ БИЛЕТ)
    // 3. Confirm (в TEST может не создать билет — это ОК)
await api(`/booking/${bookingId}/confirm`, { method: 'POST' });

// 4. ВСЕГДА идём на экран билета
navigation.replace('TicketDetails', {
  bookingId,
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.bottomBlock, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого к оплате</Text>
          <Text style={styles.totalAmount}>
            {Number(amount).toLocaleString('ru-RU')} {currency}
          </Text>
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
      </View>
    </SafeAreaView>
  );
}

/* ===== STYLES — НЕ ТРОНУТЫ ===== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  bottomBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, color: '#666' },
  totalAmount: { fontSize: 22, fontWeight: '700' },
  payButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});