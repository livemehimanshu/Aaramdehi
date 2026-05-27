import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default axiosInstance;
