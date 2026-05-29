import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

export const api = axios.create({
  // ✅ Fix: Local dev में proxy (/api) का उपयोग करें, 
  // और प्रोडक्शन में domain का, लेकिन double '/api' से बचें।
  baseURL: (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, ""),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Request interceptor to automatically attach the access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;