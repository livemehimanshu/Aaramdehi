import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

/**
 * ✅ Fix: baseURL ko empty rakhein agar aapke code mein calls pehle se '/api/' use kar rahe hain.
 * Isse localhost:5173/api/api/auth/login wala error solve ho jayega.
 */
const envURL = import.meta.env.VITE_API_URL || "";
const baseURL = envURL.replace(/\/$/, "");

export const api = axios.create({
  baseURL: baseURL,
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