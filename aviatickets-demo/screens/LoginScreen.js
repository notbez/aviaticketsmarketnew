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
} from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { startGoogleAuth, startYandexAuth, startMailRuAuth } from '../services/authProviders';

export default function LoginScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const REDIRECT_URI = AuthSession.makeRedirectUri({
    // expo managed: use your slug; для продакшна будет другой
    useProxy: true,
  });

  const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '<YOUR_GOOGLE_CLIENT_ID>';
  const YANDEX_CLIENT_ID = process.env.EXPO_PUBLIC_YANDEX_CLIENT_ID || '<YOUR_YANDEX_CLIENT_ID>';
  const MAILRU_CLIENT_ID = process.env.EXPO_PUBLIC_MAILRU_CLIENT_ID || '<YOUR_MAILRU_CLIENT_ID>';

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignIn = async () => {
    // Валидация полей
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    // Валидация email
    if (!validateEmail(email)) {
      Alert.alert('Ошибка', 'Введите корректный email адрес');
      return;
    }

    // Валидация пароля (минимум 6 символов)
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!data.accessToken || !data.user) {
        throw new Error('Некорректный ответ от сервера');
      }

      await login(data.accessToken, data.user);
      
      // Проверяем, нужно ли перенаправить на бронирование
      if (route.params?.returnTo === 'Booking' && route.params?.bookingData) {
        navigation.navigate('Booking', route.params.bookingData);
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось войти');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  console.log("REDIRECT:", AuthSession.makeRedirectUri({ useProxy: true }));

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
                ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
                : undefined,
            }),
          });

          await login(data.accessToken, data.user);
          
          // Проверяем, нужно ли перенаправить на бронирование
          if (route.params?.returnTo === 'Booking' && route.params?.bookingData) {
            navigation.navigate('Booking', route.params.bookingData);
          } else {
            navigation.replace('MainTabs');
          }
        } catch (error) {
          Alert.alert('Ошибка', error.message || 'Не удалось войти через Apple');
          console.error('Apple auth error:', error);
        } finally {
          setLoading(false);
        }
      }
    } catch (e) {
      if (e.code === 'ERR_CANCELED') return;
      Alert.alert('Ошибка', 'Не удалось войти через Apple');
      console.error('Apple auth error:', e);
    }
  };


const handleGoogleAuth = async () => {
  try {
    const redirectUri = REDIRECT_URI;
    const res = await startGoogleAuth();
    if (res.type !== 'success') return;
    const code = res.params?.code;
    const returnedRedirectUri = res.redirectUri;
    if (!code) throw new Error('No code returned from Google');

    const data = await api('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri: returnedRedirectUri }),
    });

    await login(data.accessToken, data.user);

    if (route.params?.returnTo === 'Booking') {
      navigation.navigate('Booking', route.params.bookingData);
    } else {
      navigation.replace('MainTabs');
    }
  } catch (e) {
    Alert.alert('Ошибка', e.message || 'Google авторизация не удалась');
    console.log('Google error:', e);
  }
};


const handleYandexAuth = async () => {
  try {
    const redirectUri = REDIRECT_URI;
    const res = await startYandexAuth();
    if (res.type !== 'success') return;
    const code = res.params?.code;
    const returnedRedirectUri = res.redirectUri;
    if (!code) throw new Error('No code returned from Yandex');

    const data = await api('/auth/yandex', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri: returnedRedirectUri }),
    });

    await login(data.accessToken, data.user);

    if (route.params?.returnTo === 'Booking') {
      navigation.navigate('Booking', route.params.bookingData);
    } else {
      navigation.replace('MainTabs');
    }
  } catch (e) {
    Alert.alert('Ошибка', e.message || 'Yandex авторизация не удалась');
    console.log('Yandex error:', e);
  }
};

const handleMailRuAuth = async () => {
  try {
    const redirectUri = REDIRECT_URI;
    const res = await startMailRuAuth();
    if (res.type !== 'success') return;
    const code = res.params?.code;
    const returnedRedirectUri = res.redirectUri;
    if (!code) throw new Error('No code returned from Mail.ru');

    const data = await api('/auth/mail', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri: returnedRedirectUri }),
    });

    await login(data.accessToken, data.user);

    if (route.params?.returnTo === 'Booking') {
      navigation.navigate('Booking', route.params.bookingData);
    } else {
      navigation.replace('MainTabs');
    }
  } catch (e) {
    Alert.alert('Ошибка', e.message || 'Mail авторизация не удалась');
    console.log('Mail error:', e);
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <MaterialCommunityIcons name="airplane" size={36} color="#000" />
        </View>

        <Text style={styles.title}>Начните путешествие</Text>
        <Text style={styles.sub}>
          Ваши данные в безопасности. Войдите, чтобы продолжить.
        </Text>

        <View style={{ marginTop: 18, width: '100%' }}>
          <Input
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.remember}>
              <View style={styles.radio} />
              <Text style={styles.remTxt}>Запомнить меня</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgot}>Забыли пароль?</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="Войти"
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>
            Нет аккаунта?{' '}
            <Text style={{ color: '#29A9E0' }}>Зарегистрироваться</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.sepWrap}>
          <View style={styles.line} />
          <Text style={styles.or}>или</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>

  {/* Google */}
  <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth}>
    <FontAwesome name="google" size={20} color="#DB4437" />
  </TouchableOpacity>

  {/* Yandex */}
  <TouchableOpacity style={styles.socialBtn} onPress={handleYandexAuth}>
    <FontAwesome name="yahoo" size={20} color="#FFCC00" />
  </TouchableOpacity>

  {/* Mail.ru */}
  <TouchableOpacity style={styles.socialBtn} onPress={handleMailRuAuth}>
    <FontAwesome name="envelope" size={20} color="#168DE2" />
  </TouchableOpacity>

  {/* Apple */}
  {Platform.OS === 'ios' && (
    <TouchableOpacity style={styles.socialBtn} onPress={handleAppleAuth}>
      <FontAwesome name="apple" size={20} color="#000" />
    </TouchableOpacity>
  )}

</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, alignItems: 'center' },
  header: { alignItems: 'center' },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto_700Bold',
    marginTop: 16,
    textAlign: 'center',
  },
  sub: {
    color: '#9A9A9A',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  remember: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  remTxt: { color: '#555', fontFamily: 'Roboto_400Regular' },
  forgot: { color: '#29A9E0', fontSize: 13, fontFamily: 'Roboto_500Medium' },
  link: { marginTop: 12 },
  linkText: { color: '#777', fontFamily: 'Roboto_400Regular' },
  sepWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  or: { marginHorizontal: 10, color: '#999', fontFamily: 'Roboto_400Regular' },
  socialRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'center',
    gap: 20,
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