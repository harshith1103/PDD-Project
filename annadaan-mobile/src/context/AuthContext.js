import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { getToken, setToken, removeToken, setUser as saveUser, removeUser } from '../utils/storage';

const AuthContext = createContext(null);

// Normalize user object to always have consistent shape
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id || user.id,
    id: user.id || user._id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'donor',
    phone: user.phone || '',
    address: user.address || '',
    location: user.location || { lat: 0, lng: 0 },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for persisted token and validate it
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          setTokenState(savedToken);
          // Validate token by fetching current user
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data) {
            const userData = normalizeUser(response.data.data);
            setUser(userData);
            await saveUser(userData);
          } else {
            // Token is invalid
            await clearAuthState();
          }
        }
      } catch (error) {
        console.log('Auth bootstrap failed:', error.message);
        await clearAuthState();
      } finally {
        setLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  const clearAuthState = async () => {
    setUser(null);
    setTokenState(null);
    await removeToken();
    await removeUser();
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        const normalized = normalizeUser(userData);
        setTokenState(newToken);
        setUser(normalized);
        await setToken(newToken);
        await saveUser(normalized);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        const normalized = normalizeUser(userData);
        setTokenState(newToken);
        setUser(normalized);
        await setToken(newToken);
        await saveUser(normalized);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
