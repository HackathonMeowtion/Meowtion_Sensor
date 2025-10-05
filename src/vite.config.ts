// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBaseUrl = env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.trim() !== ''
    ? env.VITE_API_BASE_URL
    : 'http://localhost:4000';

  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        protocol: 'ws',
        host: 'localhost',   // or your LAN / tunnel hostname
        clientPort: 3000,
      },
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  };
});
