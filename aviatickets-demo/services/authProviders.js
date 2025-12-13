// services/authProviders.js
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

function makeRedirectUri() {
  // use proxy in Expo dev (works with npx expo start)
  // это вернёт что-то вроде:
  //  - в dev с useProxy=true: https://auth.expo.io/@yourname/your-slug
  //  - в standalone: your.app://redirect
  // Мы используем expo Linking.createURL — надёжный вариант.
  try {
    const slug = (Constants?.expoConfig?.slug) || '';
    const owner = (Constants?.expoConfig?.owner) || '';
    // useProxy true path:
    return `https://auth.expo.io/@${owner || 'expo'}/${slug}`;
  } catch (e) {
    return Linking.createURL('/');
  }
}

async function startAuth({ authorizationEndpoint, clientId, scope = 'openid profile email', extraParams = {} }) {
  const redirectUri = makeRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope,
    ...extraParams,
  });

  const authUrl = `${authorizationEndpoint}?${params.toString()}`;

  // ОТЛАДОЧНЫЙ ЛОГ
  // console.log('Auth URL', authUrl);
  // console.log('Redirect URI', redirectUri);

  // Открываем внешнее окно аутентификации
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  // WebBrowser.openAuthSessionAsync возвращает объект со свойством type и url (или only type for cancel)
  // В случае success — в result.url будет redirectUri + ?code=... (или фрагмент)
  if (!result) return { type: 'error', error: 'no_result' };

  if (result.type !== 'success') {
    return result;
  }

  // Извлекаем code из вернувшегося url
  const returnedUrl = result.url || '';
  const parsed = Linking.parse(returnedUrl || '');
  // Linking.parse возвращает { queryParams: {...} } в expo
  const code = parsed?.queryParams?.code || null;

  return {
    type: result.type,
    params: { code, ...parsed?.queryParams },
    redirectUri,
    rawUrl: returnedUrl,
  };
}

/* Подключение провайдеров — используй переменные в app.json -> expo.extra
   Пример: в app.json в extra: { EXPO_PUBLIC_GOOGLE_CLIENT_ID: '...' } */
const extra = Constants.expoConfig?.extra || {};

export async function startGoogleAuth() {
  const clientId = extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google client id not set');

  return startAuth({
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId,
    scope: 'openid profile email',
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });
}

export async function startYandexAuth() {
  const clientId = extra.EXPO_PUBLIC_YANDEX_CLIENT_ID || process.env.EXPO_PUBLIC_YANDEX_CLIENT_ID;
  if (!clientId) throw new Error('Yandex client id not set');

  return startAuth({
    authorizationEndpoint: 'https://oauth.yandex.com/authorize',
    clientId,
    scope: 'login:info login:email',
  });
}

export async function startMailRuAuth() {
  const clientId = extra.EXPO_PUBLIC_MAILRU_CLIENT_ID || process.env.EXPO_PUBLIC_MAILRU_CLIENT_ID;
  if (!clientId) throw new Error('Mail.ru client id not set');

  return startAuth({
    authorizationEndpoint: 'https://oauth.mail.ru/login',
    clientId,
    scope: 'userinfo',
  });
}