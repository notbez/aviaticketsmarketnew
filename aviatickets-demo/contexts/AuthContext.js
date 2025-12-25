// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback(async (t) => {
    setTokenState(t);
    if (t) {
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, t);
      } catch (e) {
        // fallback
        await AsyncStorage.setItem(TOKEN_KEY, t);
      }
    } else {
      try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {}
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // try secure store first
        let storedToken = null;
        try {
          storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (e) {
          storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        }

        const storedUserJson = await AsyncStorage.getItem(USER_KEY);
        const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

        if (!storedToken) {
          setLoading(false);
          return;
        }

        // set temp state token to allow api() to include Authorization
        setTokenState(storedToken);

        // verify token by calling /me
        try {
          const me = await api('/users/profile');
          setUser(me);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
          await setToken(storedToken); // ensure secure store
        } catch (err) {
          console.warn('restoreSession: token invalid, clearing', err);
          await setToken(null);
          await AsyncStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } catch (err) {
        console.error('restoreSession error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [setToken]);

  const login = async (accessToken, userData) => {
    await setToken(accessToken);
    setUser(userData);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {}
  };

  const register = async (registerDto) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerDto),
    });
    if (!data?.accessToken) throw new Error('Register failed');
    await login(data.accessToken, data.user);
    return data.user;
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const updateUser = async (newData) => {
    setUser(newData);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};