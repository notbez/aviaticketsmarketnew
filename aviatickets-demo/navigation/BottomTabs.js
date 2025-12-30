// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const homeIcon = require('../assets/icons/tab-home.png');
const ticketsIcon = require('../assets/icons/tab-tickets.png');
const profileIcon = require('../assets/icons/tab-profile.png');

/* ================= CUSTOM TAB BAR ================= */

function IslandTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: insets.bottom + 12 },
      ]}
    >
      <View style={styles.island}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;

          const onPress = () => {
            if (!focused) {
              navigation.navigate(route.name);
            }
          };

          let icon, label;
          if (route.name === 'Home') {
            icon = homeIcon;
            label = 'Главная';
          } else if (route.name === 'Tickets') {
            icon = ticketsIcon;
            label = 'Билеты';
          } else {
            icon = profileIcon;
            label = 'Профиль';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabButton}
            >
              <Image
                source={icon}
                style={[
                  styles.icon,
                  { opacity: focused ? 1 : 0.5 },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  focused && styles.labelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ================= NAVIGATOR ================= */

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <IslandTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  island: {
    width: width * 0.92, // 👈 почти на всю ширину
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 12,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

    // Android
    elevation: 14,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 26,
    height: 26,
    marginBottom: 4,
  },

  label: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },

  labelActive: {
    color: '#0277bd',
  },
});