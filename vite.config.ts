import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3005,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: `http://localhost:${env.SERVER_PORT || 3006}`,
          changeOrigin: true,
        },
        '/uploads': {
          target: `http://localhost:${env.SERVER_PORT || 3006}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
