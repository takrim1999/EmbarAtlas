import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// When deployed to Vercel (or when explicitly requested), use root '/'. Otherwise default to '/nasa/' for cluster subpath routing.
const basePath = process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH || '/nasa/');

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/nasa/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
