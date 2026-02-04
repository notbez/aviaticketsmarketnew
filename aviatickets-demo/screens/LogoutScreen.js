import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Logout screen that handles user session cleanup
 * Clears all stored data and redirects to login
 * TODO: Add logout analytics tracking
 * TODO: Implement selective data clearing options
 */
export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    performLogout();
  }, []);

  /**
   * Clear user session data and navigate to login
   */
  const performLogout = async () => {
    try {
      await AsyncStorage.clear();
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
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
