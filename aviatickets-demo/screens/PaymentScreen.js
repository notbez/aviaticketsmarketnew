// screens/PaymentScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../lib/api';
import { saveFlightView } from '../stores/FlightViewStore';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const {
    bookingId,
    amount,
    currency = '₽',
    flightView,
  } = route.params || {};

  const finalAmount = Number(amount);
  const [loading, setLoading] = useState(false);

  /* ===== ANIMATION (UI ONLY) ===== */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ===== PAYMENT LOGIC — НЕ ТРОГАЕМ ===== */
  const handlePayment = async () => {
    try {
      setLoading(true);

      await api(`/booking/${bookingId}/pay`, { method: 'POST' });
      await api(`/booking/${bookingId}/confirm`, { method: 'POST' });

      saveFlightView(bookingId, flightView);

      navigation.replace('TicketDetails', {
        bookingId,
        flightView,
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

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        {/* AMOUNT CARD */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Итого к оплате</Text>
          <Text style={styles.amountValue}>
            {finalAmount.toLocaleString('ru-RU')} {currency}
          </Text>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <FontAwesome5 name="ticket-alt" size={16} color="#0277bd" />
            <Text style={styles.detailText}>Авиабилет</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="security" size={18} color="#0277bd" />
            <Text style={styles.detailText}>
              Безопасный платёж
            </Text>
          </View>
        </View>

        {/* PAY BUTTON */}
        <TouchableOpacity
          style={[
            styles.payButton,
            loading && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Оплатить
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

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
    borderRadius: 22,
    padding: 24,
    marginTop: 32,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  amountLabel: {
    fontSize: 14,
    color: '#555',
  },

  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0277bd',
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: '#dbe9f6',
    marginVertical: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  detailText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8fb',
    borderRadius: 16,
    padding: 14,
    marginTop: 24,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#444',
    flex: 1,
  },

  payButton: {
    marginTop: 32,
    backgroundColor: '#0277bd',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  payButtonDisabled: {
    opacity: 0.6,
  },

  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});