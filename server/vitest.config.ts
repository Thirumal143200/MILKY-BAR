import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Longer timeouts to prevent flaky failures on slower CI agents
    testTimeout: 30000,
    hookTimeout: 30000,
    // Disable parallel execution of test files to prevent SQLite write-lock collisions
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
