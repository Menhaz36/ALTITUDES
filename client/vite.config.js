import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // '/api': 'http://localhost:3000'
      '/api':{
        target:'https://altitudes-9sn7.onrender.com',
        changeOrigin:true,
        secure:false
      
      }
    }
  },
  plugins: [
    tailwindcss(),
    react()],
})
