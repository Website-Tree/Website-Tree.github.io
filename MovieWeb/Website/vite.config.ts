import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { cartographer } from '@replit/vite-plugin-cartographer';
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal';
import shadcnThemeJson from '@replit/vite-plugin-shadcn-theme-json';

export default defineConfig({
  base: '/movie-streaming-website/', // Base path for GitHub Pages
  plugins: [
    react(),
    cartographer(),
    runtimeErrorModal(),
    shadcnThemeJson(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});