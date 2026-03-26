import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'hls.js',
      'react-hot-toast',
      'lucide-react',
    ],
  },
  server: {
    port: 5173,
  },
})
