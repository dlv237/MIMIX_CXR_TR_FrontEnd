import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: "/mimix-cxr-tr/",
  plugins: [react()],

  server: {
   port: 8080,
   host: true,
  },

  preview: {
    host: true,
    port: 8080,
  },
 });
