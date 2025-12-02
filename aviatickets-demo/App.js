/**
 * App.js - Корневой компонент React Native приложения
 * 
 * Этот файл является точкой входа приложения и выполняет:
 * 1. Загрузку шрифтов Roboto
 * 2. Инициализацию AuthProvider для управления состоянием авторизации
 * 3. Настройку навигации через NavigationContainer
 * 4. Отображение экрана загрузки пока шрифты не загружены
 * 
 * @component App
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import RootNavigator from './navigation/RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './screens/SplashScreen';

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
 * Главный компонент приложения
 * 
 * @returns {JSX.Element} Корневой компонент с навигацией и провайдерами
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
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return <SplashScreen />;
  }

  // Когда шрифты загружены, рендерим основное приложение
  // AuthProvider оборачивает все приложение для доступа к состоянию авторизации
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}