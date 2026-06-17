import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the static build works inside the BGU sandboxed iframe (relative asset paths).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2019',
    outDir: 'dist',
  },
});
