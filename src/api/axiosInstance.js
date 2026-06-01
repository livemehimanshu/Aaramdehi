import axios from 'axios';

// Use a relative /api path in production so Vercel rewrites work reliably.
// Local development falls back to the local backend when env var is missing.
const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default axiosInstance;
