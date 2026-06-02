import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

// ✅ Standardized API Base URL logic
// Local development uses VITE_API_URL or /api proxy.
// Production always uses /api so Vercel rewrites forward to the backend reliably.
const envApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;

const apiBaseURL = envApiUrl || (isProd ? 'https://aaramdehi-backend.onrender.com' : '/api');

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: { }, // Remove fixed Content-Type to allow browser to set it for FormData
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