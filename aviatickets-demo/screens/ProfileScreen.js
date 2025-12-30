// screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout, user, token } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('MainTabs', { screen: 'Profile' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const profile = {
    name: user?.fullName || 'Пользователь',
    email: user?.email || '',
    avatar:
      user?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=E3F2FD&color=0277BD&rounded=true&size=256`,
  };

  const menu = [
    {
      key: 'account',
      title: 'Аккаунт',
      icon: <MaterialIcons name="person" size={20} color="#0277bd" />,
      screen: 'Account',
    },
    {
      key: 'payments',
      title: 'История платежей',
      icon: <FontAwesome5 name="wallet" size={18} color="#0277bd" />,
      screen: 'Payments',
    },
    {
      key: 'support',
      title: 'Поддержка',
      icon: <MaterialIcons name="support-agent" size={20} color="#0277bd" />,
      screen: 'SupportOptions',
    },
    {
      key: 'settings',
      title: 'Настройки',
      icon: <MaterialIcons name="settings" size={20} color="#0277bd" />,
      screen: 'Settings',
    },
  ];

  if (!token || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>

        <View style={styles.empty}>
          <MaterialIcons name="person-outline" size={80} color="#cfd8dc" />
          <Text style={styles.emptyTitle}>Вы не авторизованы</Text>
          <Text style={styles.emptyText}>
            Войдите в аккаунт, чтобы управлять профилем
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryText}>Войти</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.secondaryText}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {/* MENU */}
        <View style={styles.menu}>
          {menu.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuIcon}>{item.icon}</View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={22}
                color="#b0bec5"
              />
            </TouchableOpacity>
          ))}

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <MaterialIcons name="exit-to-app" size={20} color="#e53935" />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },

  card: {
    marginHorizontal: 20,
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },

  menu: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  logout: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#e53935',
  },

  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    color: '#111',
  },

  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  primaryButton: {
    backgroundColor: '#0277bd',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: '#0277bd',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#0277bd',
    fontSize: 16,
    fontWeight: '700',
  },
});