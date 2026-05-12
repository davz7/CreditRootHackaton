import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['step-trimming-ecology.ngrok-free.dev'],
    proxy: {
      // Proxy específico para cetes-rate
      '/api/cetes-rate': {
        target: 'https://stablebonds.etherfuse.com',
        changeOrigin: true,
        rewrite: () => '/bonds',  // siempre va a /bonds sin importar el path
      },
      // Proxy para la Ramp API (nuevo)
      '/api/etherfuse-ramp': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    }
  }
})