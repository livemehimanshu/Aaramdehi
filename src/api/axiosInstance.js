import axios from 'axios';

// Use a relative /api path in production so Vercel rewrites work reliably.
// Local development falls back to the local backend when env var is missing.
// ✅ Universal Setup: Proxy/Rewrites automatically handle routing.
const apiBase = ''; 

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default axiosInstance;
