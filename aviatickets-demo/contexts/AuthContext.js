// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // helper: set token both in state and storage
  const setToken = useCallback(async (t) => {
    setTokenState(t);
    if (t) {
      await AsyncStorage.setItem('authToken', t);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }, []);

  // restore session on start
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');

        if (!storedToken) {
          setLoading(false);
          return;
        }

        // try fetch /me to validate token
        try {
          const me = await api('/me');
          setUser(me);
          setTokenState(storedToken);
          await AsyncStorage.setItem('user', JSON.stringify(me));
        } catch (err) {
          // если получаем Unauthorized - очищаем
          console.warn('restoreSession: token invalid, clearing storage', err);
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          setUser(null);
          setTokenState(null);
        }
      } catch (err) {
        console.error('restoreSession error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [setToken]);

  // login: получает accessToken и user (backend)
  const login = async (accessToken, userData) => {
    await setToken(accessToken);
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // register: same shape as login returns from backend
  const register = async (registerDto) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerDto),
    });
    if (!data?.accessToken) throw new Error('Register failed');
    await login(data.accessToken, data.user);
    return data.user;
  };

  // logout
  const logout = async () => {
    await setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  // update user in context + storage
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
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};