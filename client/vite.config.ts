import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'crypto'],
    },
  },
  plugins: [react()],
  server: {
    port: 5000,
    host: true,
  },
  preview: {
    port: 5000,
  },
});
