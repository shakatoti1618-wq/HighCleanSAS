import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    env: { CORS_ORIGIN: 'http://localhost:5173' },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/**/*.test.ts',
        'src/generated/**',
        'src/server.ts',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        branches: 56,
        functions: 88,
        lines: 82,
      },
    },
  },
})