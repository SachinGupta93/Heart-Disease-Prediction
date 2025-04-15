import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// Check if SSL certificates exist
const sslKeyPath = path.resolve('./localhost-key.pem')
const sslCertPath = path.resolve('./localhost.pem')

const hasSSLCerts = 
  fs.existsSync(sslKeyPath) && 
  fs.existsSync(sslCertPath)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build configuration for production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'framer-motion'],
          chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  // Optimize the development experience
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  // Environment variables configuration
  envPrefix: 'VITE_'
})