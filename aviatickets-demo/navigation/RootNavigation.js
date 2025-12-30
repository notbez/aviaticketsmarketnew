import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabs from './BottomTabs';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SelectCityScreen from '../screens/SelectCityScreen';

import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FaqScreen from '../screens/FaqScreen';
import SupportScreen from '../screens/SupportScreen';
import SupportOptionsScreen from '../screens/SupportOptionsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PassengerInfoScreen from '../screens/PassengerInfoScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TicketDetailsScreen from '../screens/TicketDetailsScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="SelectCity" component={SelectCityScreen} />
      <Stack.Screen name="PassengerInfo" component={PassengerInfoScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen}/>

      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      <Stack.Screen name="SupportOptions" component={SupportOptionsScreen} />
      <Stack.Screen name="Faq" component={FaqScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />

      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}