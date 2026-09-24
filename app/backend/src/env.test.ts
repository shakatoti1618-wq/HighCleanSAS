import { describe, expect, it } from 'vitest'
import { envSchema } from './config/env.js'

const productionBase = {
  NODE_ENV: 'production',
  CORS_ORIGIN: 'https://highclean.example',
  SESSION_SECRET: 's'.repeat(40),
  ADMIN_EMAIL: 'admin@highclean.example',
  ADMIN_PASSWORD: 'super-secret-strong-2026',
  RESEND_API_KEY: 're_test_123',
  EMAIL_FROM: 'notificaciones@highcleansa.example',
  NOTIFY_EMAIL_CONTACT: 'contacto@highclean.example',
  NOTIFY_EMAIL_JOBS: 'hv@highclean.example',
  DATABASE_URL:
    'postgresql://usuario:clave@localhost:5432/highclean?schema=public',
  R2_ACCOUNT_ID: 'cuenta123',
  R2_ACCESS_KEY_ID: 'clave-acceso-123',
  R2_SECRET_ACCESS_KEY: 'secreto-r2-123',
  R2_ENDPOINT: 'https://abcdef1234567890abc.r2.cloudflarestorage.com',
  R2_BUCKET_NAME: 'highclean-media',
  R2_PUBLIC_BASE_URL: 'https://media.highclean.example',
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

  it('rechaza el remitente de desarrollo (onboarding@resend.dev)', () => {
    const result = envSchema.safeParse({
      ...productionBase,
      EMAIL_FROM: 'onboarding@resend.dev',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'EMAIL_FROM',
      )
    }
  })

  it('rechaza la ausencia de credenciales R2 en producción', () => {
    const {
      R2_ACCOUNT_ID: _cuenta,
      R2_ACCESS_KEY_ID: _acceso,
      R2_SECRET_ACCESS_KEY: _secreto,
      R2_ENDPOINT: _endpoint,
      R2_BUCKET_NAME: _bucket,
      R2_PUBLIC_BASE_URL: _publica,
      ...sinR2
    } = productionBase
    const result = envSchema.safeParse(sinR2)

    expect(result.success).toBe(false)
    if (!result.success) {
      for (const clave of [
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_ENDPOINT',
        'R2_BUCKET_NAME',
        'R2_PUBLIC_BASE_URL',
      ]) {
        expect(
          result.error.issues.map((issue) => issue.path.join('.')),
        ).toContain(clave)
      }
    }
  })

  it('rechaza la ausencia de EMAIL_FROM con su default de desarrollo', () => {
    const { EMAIL_FROM: _omitido, ...sinFrom } = productionBase
    const result = envSchema.safeParse(sinFrom)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
        'EMAIL_FROM',
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

describe('envSchema: política de contraseña del administrador', () => {
  it('rechaza una ADMIN_PASSWORD corta o sin letra o sin número', () => {
    for (const adminPassword of ['corta123', 'soloLetrasSinNumeros', '123456789012']) {
      const result = envSchema.safeParse({
        ...productionBase,
        ADMIN_PASSWORD: adminPassword,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.map((issue) => issue.path.join('.')),
        ).toContain('ADMIN_PASSWORD')
      }
    }
  })

  it('acepta una ADMIN_PASSWORD que cumple la política', () => {
    const result = envSchema.safeParse({
      ...productionBase,
      ADMIN_PASSWORD: 'Clave-Fuerte-2026-Modulo',
    })

    expect(result.success).toBe(true)
  })
})