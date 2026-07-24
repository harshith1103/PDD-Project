import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, getCustomApiUrl } from '../utils/storage';

// Default active machine LAN IP for SIMATS Wi-Fi network
const DEFAULT_LAN_IP = '172.25.39.66';

// Automatically detect host machine's IP address from Expo
const getHostIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.developer?.tool;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    // Ignore exp.direct tunnel domains because they point to Metro JS packager, not Express API port 5000
    if (
      ip &&
      ip !== 'localhost' &&
      ip !== '127.0.0.1' &&
      !ip.includes('exp.direct') &&
      !ip.includes('expo.direct')
    ) {
      return ip;
    }
  }
  return null;
};

export const getBaseUrl = async () => {
  // 1. User-configured custom URL in AsyncStorage
  const customUrl = await getCustomApiUrl();
  if (customUrl && customUrl.trim().length > 0) {
    const formatted = customUrl.trim().replace(/\/$/, '');
    return formatted.endsWith('/api') ? formatted : `${formatted}/api`;
  }

  // 2. Web browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // 3. Dynamic LAN IP auto-detection via Expo Go
  const detectedIp = getHostIp();
  if (detectedIp) {
    return `http://${detectedIp}:5000/api`;
  }

  // 4. Default to laptop's Wi-Fi LAN IP for standalone APKs
  return `http://${DEFAULT_LAN_IP}:5000/api`;
};

const api = axios.create({
  baseURL: `http://${DEFAULT_LAN_IP}:5000/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token & dynamic base URL to every request
api.interceptors.request.use(
  async (config) => {
    const activeBaseUrl = await getBaseUrl();
    config.baseURL = activeBaseUrl;

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';
      error.message = message;
    } else if (error.request) {
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export default api;
