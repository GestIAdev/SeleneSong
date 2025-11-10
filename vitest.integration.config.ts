/**
 * Vitest Configuration for Integration Tests
 * Runs tests against a real PostgreSQL database
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    globals: true,

    // Test files matching
    include: ['**/*.integration.test.ts'],
    exclude: ['node_modules', 'dist'],

    // Timeout for integration tests (longer than unit tests)
    testTimeout: 30000,

    // Database setup
    setupFiles: ['./src/__tests__/integration.setup.ts'],

    // Reporter
    reporters: ['verbose'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
