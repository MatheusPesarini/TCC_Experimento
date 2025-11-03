import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
    },
  },
});