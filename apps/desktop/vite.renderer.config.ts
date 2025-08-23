/// <reference types="./forge.env.d.ts" />

import path from 'path';

import react from '@vitejs/plugin-react';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';

import { pluginExposeRenderer } from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [react(), pluginExposeRenderer(name)],
    resolve: {
      alias: {
        '@brainbox/desktop': path.resolve(__dirname, './src'),
        '@brainbox/core': path.resolve(__dirname, '../../packages/core/src'),
        '@brainbox/crdt': path.resolve(__dirname, '../../packages/crdt/src'),
        '@brainbox/client': path.resolve(
          __dirname,
          '../../packages/client/src'
        ),
        '@brainbox/ui': path.resolve(__dirname, '../../packages/ui/src'),
      },
    },
    clearScreen: false,
  } as UserConfig;
});
