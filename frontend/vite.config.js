import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Ensure public directory is copied to dist
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true, // Explicitly copy public directory
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'nexora.proplusdata.co',
      'www.nexora.proplusdata.co',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // string shorthand: /api -> http://localhost:5000/api
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});