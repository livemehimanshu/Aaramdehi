import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'react-hot-toast'
import app from './api/firebase.js';
// Firebase is initialized in src/api/firebase.js (singleton)

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <App />
    <Toaster position="top-center" reverseOrder={false} />
  </CartProvider>
)
