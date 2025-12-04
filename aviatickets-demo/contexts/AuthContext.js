// ~/aviatickets-demo/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
import { API_BASE } from '../constants/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  //  Restore session on app start
  // ---------------------------
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (!res.ok) {
        // Токен просрочен или недействителен
        await AsyncStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } else {
        const userData = await res.json();
        setToken(storedToken);
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Session restore error:', err);
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    await AsyncStorage.setItem('authToken', authToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ---------------------------
  // Update user profile
  // ---------------------------
  const updateUser = async (newData) => {
    setUser(newData);
    await AsyncStorage.setItem('user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};