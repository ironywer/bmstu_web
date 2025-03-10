import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: {
    proxy: {
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/positions': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/warehouse': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
