import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Ignore corrupted temp folders to prevent watcher crashes
      ignored: ['**/pages_temp/**']
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'lucide-react', 'zod', '@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})

