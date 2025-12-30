// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import {
  startGoogleAuth,
  startYandexAuth,
  startMailRuAuth,
} from '../services/authProviders';

export default function LoginScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  /* ===== STATE (НЕ МЕНЯЛИ) ===== */
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');

  const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

  /* ===== LOGIN ===== */
  const handleSignIn = async () => {
  if (!identifier.trim() || !password.trim()) {
    Alert.alert('Ошибка', 'Заполните все поля');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
    return;
  }

  const value = identifier.trim();
  const isEmail = value.includes('@');

  const payload = {
    password,
    ...(isEmail
      ? { email: value.toLowerCase() }
      : { phone: value }),
  };

  setLoading(true);

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!data.accessToken || !data.user) {
      throw new Error('Некорректный ответ от сервера');
    }

    await login(data.accessToken, data.user);

    const { returnTo, params } = route.params || {};

    returnTo
      ? navigation.replace(returnTo, params)
      : navigation.replace('MainTabs');
  } catch (e) {
    Alert.alert('Ошибка', e.message || 'Не удалось войти');
  } finally {
    setLoading(false);
  }
};

  /* ===== APPLE ===== */
  const handleAppleAuth = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        setLoading(true);
        try {
          const data = await api('/auth/apple', {
            method: 'POST',
            body: JSON.stringify({
              identityToken: credential.identityToken,
              authorizationCode: credential.authorizationCode,
              fullName: credential.fullName
                ? `${credential.fullName.givenName || ''} ${
                    credential.fullName.familyName || ''
                  }`.trim()
                : undefined,
            }),
          });

          await login(data.accessToken, data.user);

          if (route.params?.returnTo === 'Booking') {
            navigation.navigate('Booking', route.params.bookingData);
          } else {
            navigation.replace('MainTabs');
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (e) {
      if (e.code !== 'ERR_CANCELED') {
        Alert.alert('Ошибка', 'Не удалось войти через Apple');
      }
    }
  };

  /* ===== SOCIAL ===== */
  const handleGoogleAuth = async () => {
    try {
      const res = await startGoogleAuth();
      if (res.type !== 'success') return;

      const data = await api('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          code: res.params.code,
          redirectUri: res.redirectUri,
        }),
      });

      await login(data.accessToken, data.user);

      const { returnTo, params } = route.params || {};

      returnTo
        ? navigation.replace(returnTo, params)
        : navigation.replace('MainTabs');
    } catch {
      Alert.alert('Ошибка', 'Google авторизация не удалась');
    }
  };

  const handleYandexAuth = async () => {
    try {
      const res = await startYandexAuth();
      if (res.type !== 'success') return;

      const data = await api('/auth/yandex', {
        method: 'POST',
        body: JSON.stringify({
          code: res.params.code,
          redirectUri: res.redirectUri,
        }),
      });

      await login(data.accessToken, data.user);

      const { returnTo, params } = route.params || {};

    returnTo
      ? navigation.replace(returnTo, params)
      : navigation.replace('MainTabs');
    } catch {
      Alert.alert('Ошибка', 'Yandex авторизация не удалась');
    }
  };

  const handleMailRuAuth = async () => {
    try {
      const res = await startMailRuAuth();
      if (res.type !== 'success') return;

      const data = await api('/auth/mail', {
        method: 'POST',
        body: JSON.stringify({
          code: res.params.code,
          redirectUri: res.redirectUri,
        }),
      });

      await login(data.accessToken, data.user);

      const { returnTo, params } = route.params || {};

      returnTo
        ? navigation.replace(returnTo, params)
        : navigation.replace('MainTabs');
    } catch {
      Alert.alert('Ошибка', 'Mail авторизация не удалась');
    }
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logo}>
            <MaterialCommunityIcons
              name="airplane"
              size={28}
              color="#0277bd"
            />
          </View>
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.sub}>
            Войдите, чтобы продолжить бронирование
          </Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Телефон или Email"
            placeholder="+7 999 123-45-67"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <Input
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgot}>Забыли пароль?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Войти"
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() =>
            navigation.navigate('SignUp', {
              returnTo: route.params?.returnTo,
              params: route.params?.params,
            })
          }
        >
          <Text style={styles.linkText}>
            Нет аккаунта?{' '}
            <Text style={{ color: '#0277bd', fontWeight: '700' }}>
              Зарегистрироваться
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.sepWrap}>
          <View style={styles.line} />
          <Text style={styles.or}>или</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth}>
            <FontAwesome name="google" size={20} color="#DB4437" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleYandexAuth}>
            <FontAwesome name="yahoo" size={20} color="#FFCC00" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleMailRuAuth}>
            <FontAwesome name="envelope" size={20} color="#168DE2" />
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.socialBtn} onPress={handleAppleAuth}>
              <FontAwesome name="apple" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  sub: { fontSize: 14, color: '#777', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 12 },
  forgot: { fontSize: 13, color: '#0277bd', fontWeight: '600' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#777' },
  sepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  or: { marginHorizontal: 12, fontSize: 13, color: '#999' },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    elevation: 2,
  },
});