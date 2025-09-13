import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.ELECTRON === 'true' ? './' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development'
  },
  server: {
    port: 5173,
    strictPort: true
  }
});