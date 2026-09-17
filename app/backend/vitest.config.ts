import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    env: { CORS_ORIGIN: 'http://localhost:5173' },
  },
})