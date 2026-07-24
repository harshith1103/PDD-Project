import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    if (hostname) {
      return `${protocol}//${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

// Request interceptor — attach JWT token & dynamic base URL
API.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem('annadaan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('annadaan_token');
      localStorage.removeItem('annadaan_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
