import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 8080,
    host: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
    },
  },

  preview: {
    host: true,
    port: 8080,
  },
 });
