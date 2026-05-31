import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

// ✅ Standardized API Base URL logic
// Render URL ko fallback ke roop mein add kiya
const envApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;

// Production mein agar VITE_API_URL nahi hai, toh absolute path zaroori hai
const apiBaseURL = isProd ? (envApiUrl ? envApiUrl.replace(/\/$/, "") : null) : "/api";

if (isProd && !apiBaseURL) {
  console.error("❌ CRITICAL: VITE_API_URL is missing in Vercel Environment Variables. API calls will fail.");
}

export const api = axios.create({
  baseURL: apiBaseURL || "/api",
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