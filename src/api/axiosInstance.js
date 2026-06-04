import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;
const normalizedEnvApiUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';

// In production, use the actual Render backend if no env var is provided.
// In development, use the local Vite proxy via absolute /api paths.
const apiBase = normalizedEnvApiUrl || (isProd ? 'https://aaramdehi.onrender.com/api' : '/api');

const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// ✅ Attach saved accessToken or adminToken to every request automatically.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('adminToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle unauthorized responses globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized (401): Session expired or invalid token.");
      // Optional: Clear tokens and redirect if needed
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('adminToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
