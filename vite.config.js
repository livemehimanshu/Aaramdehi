import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Auth routes (login/register) ko backend par bhejne ke liye
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // 2. Baki normal API routes ke liye
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Naye build se pehle purane cache ko clear karne ke liye
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('chart.js') || id.includes('recharts') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            if (id.includes('@tiptap') || id.includes('react-quill')) {
              return 'vendor-editor';
            }
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'vendor-pdf';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-others';
          }
        },
      },
    },
  },
})