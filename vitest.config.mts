import { defineConfig } from 'vitest/config';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
    // Expose .env.local to tests (RLS suite needs URL + anon key).
    env: loadEnv(mode, process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname),
    },
  },
}));
