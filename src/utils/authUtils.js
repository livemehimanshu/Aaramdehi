import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

/**
 * ✅ Fix: baseURL को संतुलित करें। 
 * अगर VITE_API_URL सेट नहीं है, तो "/api" (Vite Proxy) का उपयोग करें।
 * ध्यान दें: API calls (जैसे /auth/login) में दोबारा /api न जोड़ें।
 */
export const api = axios.create({
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