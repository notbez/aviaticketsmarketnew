import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.airplane}>✈️</Text>
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
  airplane: {
    fontSize: 60,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
});