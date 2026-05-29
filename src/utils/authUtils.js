import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

// ✅ Standardized API Base URL logic
const apiBaseURL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const api = axios.create({
  // If base URL is provided (e.g. from Vercel env), ensure it ends with /api
  // In local development, simply use "/api" which hits Vite proxy
  baseURL: apiBaseURL ? (apiBaseURL.endsWith('/api') ? apiBaseURL : `${apiBaseURL}/api`) : "/api",
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