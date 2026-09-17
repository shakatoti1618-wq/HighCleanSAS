/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { isProductionValidSiteUrl } from './scripts/seo-env.mjs'

function seoEnvWarning(): Plugin {
  return {
    name: 'seo-env-warning',
    configResolved(config) {
      if (config.command !== 'build') return

      const env = loadEnv(config.mode, config.root, ['VITE_'])
      const raw = env.VITE_SITE_URL
      if (!isProductionValidSiteUrl(raw)) {
        const reason = raw
          ? `VITE_SITE_URL="${raw}" no es una URL https válida.`
          : 'VITE_SITE_URL no está definida.'
        console.warn(
          `[seo] ${reason} En producción (NODE_ENV=production) el prebuild falla si no es una URL https válida (ver scripts/generate-seo-files.mjs).`,
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoEnvWarning()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 40,
        branches: 23,
        functions: 28,
        lines: 41,
      },
    },
  },
})