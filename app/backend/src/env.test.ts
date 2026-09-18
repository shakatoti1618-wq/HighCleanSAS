import { describe, expect, it } from 'vitest'
import { envSchema } from './config/env.js'

const productionBase = {
  NODE_ENV: 'production',
  CORS_ORIGIN: 'https://highclean.example',
  SESSION_SECRET: 's'.repeat(40),
  ADMIN_EMAIL: 'admin@highclean.example',
  ADMIN_PASSWORD: 'super-secret-strong-2026',
  RESEND_API_KEY: 're_test_123',
  NOTIFY_EMAIL_CONTACT: 'contacto@highclean.example',
  NOTIFY_EMAIL_JOBS: 'hv@highclean.example',
  DATABASE_URL:
    'postgresql://usuario:clave@localhost:5432/highclean?schema=public',
}

describe('envSchema en producción', () => {
  it('rechaza CORS_ORIGIN igual a * (deshabilitaría la protección CSRF)', () => {
    const result = envSchema.safeParse({ ...productionBase, CORS_ORIGIN: '*' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'CORS_ORIGIN',
      )
    }
  })

  it('acepta un CORS_ORIGIN exacto (o varios separados por coma)', () => {
    const result = envSchema.safeParse({
      ...productionBase,
      CORS_ORIGIN: 'https://highclean.example,https://www.highclean.example',
    })

    expect(result.success).toBe(true)
  })

  it('rechaza el SESSION_SECRET de desarrollo', () => {
    const result = envSchema.safeParse({
      ...productionBase,
      SESSION_SECRET: 'highclean-dev-session-secret-change-me-123',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'SESSION_SECRET',
      )
    }
  })

  it('rechaza la ausencia de RESEND_API_KEY', () => {
    const { RESEND_API_KEY: _omitido, ...sinResend } = productionBase
    const result = envSchema.safeParse(sinResend)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'RESEND_API_KEY',
      )
    }
  })

  it('rechaza la ausencia de NOTIFY_EMAIL_CONTACT', () => {
    const { NOTIFY_EMAIL_CONTACT: _omitido, ...sinContacto } = productionBase
    const result = envSchema.safeParse(sinContacto)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'NOTIFY_EMAIL_CONTACT',
      )
    }
  })

  it('rechaza la ausencia de NOTIFY_EMAIL_JOBS', () => {
    const { NOTIFY_EMAIL_JOBS: _omitido, ...sinJobs } = productionBase
    const result = envSchema.safeParse(sinJobs)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'NOTIFY_EMAIL_JOBS',
      )
    }
  })
})

describe('envSchema en desarrollo', () => {
  it('acepta CORS_ORIGIN * (sin validación CSRF por origen en dev)', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      DATABASE_URL:
        'postgresql://usuario:clave@localhost:5432/highclean?schema=public',
    })

    expect(result.success).toBe(true)
  })
})