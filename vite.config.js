import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'ui-vendor': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Generate source maps for production debugging
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
})
