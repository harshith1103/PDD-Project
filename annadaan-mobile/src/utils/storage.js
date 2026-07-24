import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'annadaan_token';
const USER_KEY = 'annadaan_user';
const API_URL_KEY = 'annadaan_custom_api_url';

export const getCustomApiUrl = async () => {
  try {
    return await AsyncStorage.getItem(API_URL_KEY);
  } catch {
    return null;
  }
};

export const setCustomApiUrl = async (url) => {
  try {
    if (!url) {
      await AsyncStorage.removeItem(API_URL_KEY);
    } else {
      await AsyncStorage.setItem(API_URL_KEY, url);
    }
  } catch (e) {
    console.error('Error saving custom API URL:', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Error saving token:', e);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Error removing token:', e);
  }
};

export const getUser = async () => {
  try {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

export const setUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user:', e);
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Error removing user:', e);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
};
