import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [basicSsl(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../client/src'),
      'react': path.resolve(__dirname, '../client/node_modules/react'),
      'react-dom': path.resolve(__dirname, '../client/node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, '../client/node_modules/react-router-dom'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
