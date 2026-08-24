import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'react-hot-toast'

const CHUNK_RECOVERY_KEY = 'aaramdehi-chunk-recovery';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = String(event.message || '');
    if (!/failed to fetch dynamically imported module|expected a javascript|mime type of 'text\/html'/i.test(message)) return;
    if (sessionStorage.getItem(CHUNK_RECOVERY_KEY)) return;
    sessionStorage.setItem(CHUNK_RECOVERY_KEY, '1');
    const url = new URL(window.location.href);
    url.searchParams.set('_asset_refresh', Date.now().toString());
    window.location.replace(url.toString());
  });

  window.setTimeout(() => sessionStorage.removeItem(CHUNK_RECOVERY_KEY), 15000);
}

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
