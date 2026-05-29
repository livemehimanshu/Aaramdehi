import axios from 'axios';

// Vercel rewrites ke liye relative path use karein.
// Dashboard mein VITE_API_URL ko empty rakhein ya sirf domain name.
const apiBase = import.meta.env.VITE_API_URL || "";

// Centralized API instance for Aaramdehi Admin & User modules
export const api = axios.create({
  // Agar VITE_API_URL empty hai, toh base path automatic current domain + '/api' banega
  baseURL: apiBase ? `${apiBase}/api` : "/api",
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