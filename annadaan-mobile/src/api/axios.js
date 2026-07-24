import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, getCustomApiUrl } from '../utils/storage';

// Default active machine LAN IP
const DEFAULT_LAN_IP = '172.25.39.66';

// Universal URL/IP Sanitizer and Formatter
export const formatApiEndpoint = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // Ensure http/https protocol prefix
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Automatically replace Metro / Expo packager ports (8081, 8082, 8083, 19000, 19006, 8080) with Express API port 5000
  url = url.replace(/:(8081|8082|8083|19000|19006|8080)(\/|$)/, ':5000$2');

  // If no port specified on the domain/IP, append :5000
  if (!/:\d+(\/|$)/.test(url)) {
    url = url.replace(/^(https?:\/\/[^\/]+)(\/.*)?$/, '$1:5000$2');
  }

  // Ensure URL ends with /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

// Automatically detect host machine's IP address from Expo Go environment
const getHostIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.developer?.tool;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
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
  // 1. Check user-configured custom URL in AsyncStorage (auto-sanitized)
  const customUrl = await getCustomApiUrl();
  if (customUrl && customUrl.trim().length > 0) {
    const formatted = formatApiEndpoint(customUrl);
    if (formatted) return formatted;
  }

  // 2. Web browser environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return formatApiEndpoint(`http://${window.location.hostname}:5000/api`);
    }
    return 'http://localhost:5000/api';
  }

  // 3. Dynamic LAN IP auto-detection via Expo Go
  const detectedIp = getHostIp();
  if (detectedIp) {
    return formatApiEndpoint(`http://${detectedIp}:5000/api`);
  }

  // 4. Default fallback to machine LAN IP
  return formatApiEndpoint(`http://${DEFAULT_LAN_IP}:5000/api`);
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
