/**
 * App.js - Корневой компонент React Native приложения
 * Работает с Expo SDK 46+ без expo-app-loading
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigation';
import { AuthProvider } from './contexts/AuthContext';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

/**
 * NavigationWrapper - обертка для навигации
 */
function NavigationWrapper() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * Сплэш-экран с индикатором загрузки
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

/**
 * Главный компонент приложения
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => setShowSplash(false), 2000); // Показываем сплэш 2 сек
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  // Пока шрифты не загружены или активен SplashScreen
  if (!fontsLoaded || showSplash) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});