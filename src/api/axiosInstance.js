import axios from 'axios';

// Vercel production aur local development dono ke liye '/api' base path use karein
const apiBase = import.meta.env.VITE_API_URL || 'https://aaramdehi.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default axiosInstance;
