// screens/PaymentScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const { orderId, amount = 0, currency = '₽' } = route.params || {};
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
      await new Promise(resolve => setTimeout(resolve, 800));

      Alert.alert(
        'Успешно!',
        'Оплата прошла успешно. Билет оформлен.',
        [
          {
            text: 'Перейти к билетам',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Tickets' } }],
              }),
          },
        ]
      );
    } catch {
      Alert.alert('Ошибка', 'Ошибка при оплате');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Оплата</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.headerDivider} />

      {/* CONTENT */}
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* CARD */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <Text style={styles.cardBrand}>МИР</Text>

              <Text style={styles.cardNumber}>
                2200 1234 5678 9012
              </Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>Срок действия</Text>
                  <Text style={styles.cardValue}>12 / 27</Text>
                </View>

                <View style={styles.cardChip} />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM */}
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
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#eee',
  },

  /* Scroll */
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },

  /* Card */
  cardWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    width: '100%',
    aspectRatio: 1.586,
    backgroundColor: '#1EA6FF',
    borderRadius: 18,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardBrand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  cardValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  cardChip: {
    width: 46,
    height: 34,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  /* Bottom */
  bottomBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  /* Button */
  payButton: {
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 12,
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