// lib/api.js
import { API_BASE } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * joinUrl - аккуратно соединяет base + endpoint
 */
function joinUrl(base, endpoint) {
  if (!endpoint) return base;
  if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
  if (base.endsWith('/')) base = base.slice(0, -1);
  return `${base}/${endpoint}`;
}

/**
 * api - универсальная обёртка над fetch
 * - добавляет Authorization если есть токен
 * - парсит JSON/text
 * - при 401 автоматически очищает authToken и кидает специальную ошибку 'Unauthorized'
 */
export async function api(endpoint, options = {}) {
  let token = null;
try {
  token = await SecureStore.getItemAsync('authToken');
} catch {
  token = await AsyncStorage.getItem('authToken');
}

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = joinUrl(API_BASE, endpoint);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  const text = await res.text().catch(() => null);
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // Если Unauthorized — удаляем токен, чтобы приложение не застревало
    if (res.status === 401) {
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        // ignore
      }
      // Специальная ошибка, чтобы AuthContext мог распознать
      const msg = data?.message || 'Unauthorized';
      const err = new Error(msg);
      err.name = 'Unauthorized';
      throw err;
    }

    const msg = data?.message || data?.error || (typeof data === 'string' ? data : `Request failed: ${res.status}`);
    throw new Error(msg);
  }

  return data;
}