import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ads': 'http://localhost:5000',
      '/companies': 'http://localhost:5000',
    },
  },

})
