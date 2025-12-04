// lib/api.js
import { API_BASE } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function joinUrl(base, endpoint) {
  if (!endpoint) return base;
  if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
  if (base.endsWith('/')) base = base.slice(0, -1);
  return `${base}/${endpoint}`;
}

export async function api(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('authToken');

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
    // network error
    throw new Error(`Network error: ${e.message}`);
  }

  let data = null;
  const text = await res.text().catch(() => null);
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // Пробуем понять сообщение ошибки
    const msg = data?.message || data?.error || (typeof data === 'string' ? data : null) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}