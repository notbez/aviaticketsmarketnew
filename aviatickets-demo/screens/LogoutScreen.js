import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    clearAll();
  }, []);

  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
      console.log('✓ AsyncStorage очищен');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1000);
    } catch (error) {
      console.error('Ошибка очистки:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0277bd" />
      <Text style={styles.text}>Выход из аккаунта...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
