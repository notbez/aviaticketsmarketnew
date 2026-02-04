import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Application splash screen with branding and automatic navigation
 * Displays app logo and transitions to main interface after delay
 * TODO: Add app version display and update check
 * TODO: Implement dynamic splash screen based on user state
 */
export default function SplashScreen() {
  const navigation = useNavigation();

  /**
   * Auto-navigate to main tabs after splash delay
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="airplane"
        size={64}
        color="#FFFFFF"
        style={styles.icon}
      />
      <Text style={styles.title}>Aviamarket</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#29A9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});