import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const localApiTarget = process.env.VITE_DEV_API_TARGET || 'https://aaramdehi.onrender.com'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Auth routes (login/register) ko backend par bhejne ke liye
      '/auth': {
        target: localApiTarget,
        changeOrigin: true,
        secure: false,
      },
      // 2. Baki normal API routes ke liye
      '/api': {
        target: localApiTarget,
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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('swiper')) return 'vendor-swiper';
            if (id.includes('lucide-react')) return 'vendor-icons';
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
          }
        },
      },
    },
  },
})