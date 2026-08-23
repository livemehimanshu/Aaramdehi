import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'react-hot-toast'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Aaramdehi service worker registration failed:', error);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <App />
    <Toaster position="top-center" reverseOrder={false} />
  </CartProvider>
)
