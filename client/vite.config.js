import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The browser sees one origin, so CORS never applies during development.
      // No changeOrigin: the server will need the original Host to identify the site.
      '/api': 'http://localhost:4000',
    },
  },
})
