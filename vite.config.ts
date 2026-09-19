import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
  optimizeDeps: {
    // pdfjs-dist needs to be excluded from pre-bundling to load worker correctly
    exclude: ['pdfjs-dist'],
  },
})
