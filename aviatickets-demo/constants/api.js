// constants/api.js
// API configuration with environment variable support
// For Expo: use app.json extra.apiBase or set EXPO_PUBLIC_API_BASE
// For development: create .env file with EXPO_PUBLIC_API_BASE=http://localhost:3000/api

const getApiBase = () => {
  // Try to get from environment variable (Expo)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }

  // Try to get from Constants (Expo)
  try {
    const Constants = require('expo-constants').default;
    if (Constants?.expoConfig?.extra?.apiBase) {
      return Constants.expoConfig.extra.apiBase;
    }
  } catch (e) {
    // expo-constants not available
  }

  // Default fallback - сервер на Timeweb (с учетом префикса /api)
  // Важно: ждать ответов по адресу https://aviaticketsmarket.ru/api
  return 'https://aviaticketsmarket.ru/api';
};

export const API_BASE = getApiBase();