import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

const MESSAGES = [
  '✈️ Может, пора в путешествие?',
  '🌍 Мир ждёт — куда полетим?',
  '🧳 А если слетать куда-нибудь на выходные?',
  '🔥 Иногда лучший план — купить билет',
  '😌 Пора сменить обстановку',
];

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    setEnabled(settings.status === 'granted');
  };

  const enableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение не выдано',
        'Вы можете включить уведомления в настройках телефона'
      );
      return;
    }

    await scheduleNotifications();
    setEnabled(true);
  };

  const disableNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setEnabled(false);
  };

  const scheduleNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (let i = 1; i <= 3; i++) {
      const message =
        MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Пора путешествовать',
          body: message,
        },
        trigger: {
          seconds: i * 2 * 24 * 60 * 60, // каждые ~2 дня
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уведомления</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>Путешественные уведомления</Text>
            <Switch
              value={enabled}
              onValueChange={(v) => {
                v ? enableNotifications() : disableNotifications();
              }}
            />
          </View>

          <Text style={styles.desc}>
            Иногда будем ненавязчиво напоминать, что мир ждёт тебя ✈️  
            Не чаще пары раз в неделю.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' },
  desc: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});