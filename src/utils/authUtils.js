import axios from 'axios';

// Vercel rewrites aur local proxy ke liye relative path use karein
const apiBase = import.meta.env.VITE_API_URL || "/api";

// Centralized API instance for Aaramdehi Admin & User modules
export const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json'
  },
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