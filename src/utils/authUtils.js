import axios from 'axios';

/**
 * Centralized API instance
 * Local: /api -> vite.config.js proxy handle karega
 * Prod: VITE_API_URL environment variable se aayega
 */

// ✅ Standardized API Base URL logic
const apiBaseURL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const api = axios.create({
  // Agar apiBaseURL khali hai (local), toh sirf "/api" use karein. 
  // Agar domain set hai, toh check karein ki kahin usmein pehle se "/api" toh nahi.
  baseURL: apiBaseURL 
    ? (apiBaseURL.endsWith('/api') ? apiBaseURL : `${apiBaseURL}/api`) 
    : "/api",
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