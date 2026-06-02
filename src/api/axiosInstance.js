import axios from 'axios';

// Use a relative /api path in production so Vercel rewrites work reliably.
// Local development falls back to the local backend when env var is missing.
const apiBase = '';

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
