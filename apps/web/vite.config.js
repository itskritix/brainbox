import { resolve } from 'node:path';

import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  resolve: {
    alias: {
      '@brainbox/web': resolve(__dirname, './src'),
      '@brainbox/core': resolve(__dirname, '../../packages/core/src'),
      '@brainbox/crdt': resolve(__dirname, '../../packages/crdt/src'),
      '@brainbox/client': resolve(__dirname, '../../packages/client/src'),
      '@brainbox/ui': resolve(__dirname, '../../packages/ui/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  plugins: [
    viteReact(),
    VitePWA({
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      base: '/',
      includeAssets: ['favicon.ico'],
      devOptions: {
        enabled: false, // Disable in development to reduce worker warnings
        type: 'module',
      },
      srcDir: 'src/workers',
      filename: 'service.ts',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      injectManifest: {
        minify: false,
        enableWorkboxModulesLogs: false, // Reduce logging
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
});
