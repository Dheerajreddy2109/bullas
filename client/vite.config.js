import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The browser sees one origin, so CORS never applies during development.
      // Must be the object form: a plain string makes Vite turn changeOrigin on, which
      // replaces the Host the server needs to work out which site a request is for.
      '/api': { target: 'http://localhost:4000', changeOrigin: false },
    },
  },
})
