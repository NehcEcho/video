import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 1659,
    proxy: {
      '/api': {
        target: 'http://localhost:1658',
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
