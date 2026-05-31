import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

// ✅ Standardized API Base URL logic
// Render URL ko fallback ke roop mein add kiya
const apiBaseURL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const api = axios.create({
  // Agar local dev hai toh "/api" use karein (Vite Proxy ke liye)
  // Agar production domain hai, toh "/api" prefix ensure karein
  // Added logic to handle environment correctly
  baseURL: import.meta.env.PROD ? apiBaseURL : "/api",
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