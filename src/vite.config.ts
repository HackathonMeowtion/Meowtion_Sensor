// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        protocol: 'ws',
        host: 'localhost',   // or your LAN / tunnel hostname
        clientPort: 3000,
      },
    },
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  };
});
