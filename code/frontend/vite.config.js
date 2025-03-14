import path from 'path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
        target: 'http://localhost:5000/',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Use body-parser to parse the request body
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
})
