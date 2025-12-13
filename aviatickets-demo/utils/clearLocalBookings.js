// utils/clearLocalBookings.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS_TO_CLEAR = [
  'bookings',
  'draftBooking',
  'lastSearch',
  'cart',
  // если используете другие ключи — добавьте их
];

export default async function clearLocalBookings() {
  try {
    for (const k of KEYS_TO_CLEAR) {
      await AsyncStorage.removeItem(k);
    }
    try {
      await SecureStore.deleteItemAsync('authToken'); // осторожно: очищает токен
    } catch {}
    console.log('Local booking data cleared');
  } catch (e) {
    console.error('clearLocalBookings error', e);
    throw e;
  }
}