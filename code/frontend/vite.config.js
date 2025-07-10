import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const port = process.env.PORT || 5011;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${port}/`,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (_, req, res) => {
            bodyParser.json()(req, res, () => {
              console.log('Proxying request:', req.method, req.url, req.body);
            });
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Received response from target:', proxyRes.statusCode);
          });
        },
      }
    },
  },
});
