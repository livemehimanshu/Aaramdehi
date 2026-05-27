import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Centralized API instance for Aaramdehi Admin & User modules
export const api = axios.create({
  baseURL: `${apiBase}/api`,
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