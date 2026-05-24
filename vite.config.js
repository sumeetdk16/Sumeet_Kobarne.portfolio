import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Build only shader.js as a self-contained bundle
  build: {
    lib: {
      entry: resolve(__dirname, 'shader.js'),
      name: 'PortfolioShader',
      fileName: 'shader.bundle',
      formats: ['iife'], // IIFE = works as a plain <script> tag
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // No external deps — bundle everything in
      external: [],
    },
  },
});
