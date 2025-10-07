import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 1. Importa los módulos necesarios de Node
import path from 'path';
import { fileURLToPath } from 'url';

// 2. Recrea las variables __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Wordy/',
  plugins: [react()],
  resolve: {
    alias: {
      // 3. path.resolve
      '@profilepics': path.resolve(__dirname, './src/assets/ProfilePics'),
       '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});