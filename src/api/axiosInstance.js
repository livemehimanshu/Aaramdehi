import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;
const normalizedEnvApiUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';

// In production, use the actual Render backend if no env var is provided.
// In development, use the local Vite proxy via absolute /api paths.
const apiBase = normalizedEnvApiUrl || (isProd ? 'https://aaramdehi.onrender.com' : '');

const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Attach saved accessToken to every request automatically.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
