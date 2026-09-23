import 'dotenv/config'
import { z } from 'zod'

const DEFAULT_SESSION_SECRET = 'highclean-dev-session-secret-change-me-123'
const DEFAULT_ADMIN_PASSWORD = 'change-me-admin-password-2026'
const DEFAULT_NOTIFY_EMAIL_CONTACT = 'notify-contact@highclean.local'
const DEFAULT_NOTIFY_EMAIL_JOBS = 'notify-jobs@highclean.local'
const DEFAULT_EMAIL_FROM = 'onboarding@resend.dev'

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGIN: z.string().default('*'),
    SESSION_SECRET: z.string().min(32).default(DEFAULT_SESSION_SECRET),
    ADMIN_EMAIL: z.string().email().default('admin@highclean.local'),
    ADMIN_PASSWORD: z.string().min(12).default(DEFAULT_ADMIN_PASSWORD),
    RESEND_API_KEY: z.string().optional(),
    NOTIFY_EMAIL_CONTACT: z
      .string()
      .email()
      .default(DEFAULT_NOTIFY_EMAIL_CONTACT),
    NOTIFY_EMAIL_JOBS: z.string().email().default(DEFAULT_NOTIFY_EMAIL_JOBS),
    EMAIL_FROM: z.string().email().default(DEFAULT_EMAIL_FROM),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL es obligatorio (ver .env / .env.example)'),
  })
  .superRefine((values, ctx) => {
    if (values.NODE_ENV !== 'production') return
    if (values.SESSION_SECRET === DEFAULT_SESSION_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'SESSION_SECRET no puede usar el valor de desarrollo en producción',
        path: ['SESSION_SECRET'],
      })
    }
    if (values.ADMIN_EMAIL === 'admin@highclean.local') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'ADMIN_EMAIL no puede usar el valor de desarrollo en producción',
        path: ['ADMIN_EMAIL'],
      })
    }
    if (values.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'ADMIN_PASSWORD no puede usar el valor de desarrollo en producción',
        path: ['ADMIN_PASSWORD'],
      })
    }
    if (values.CORS_ORIGIN === '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'CORS_ORIGIN no puede ser * en producción (deshabilita la protección CSRF del Módulo 15)',
        path: ['CORS_ORIGIN'],
      })
    }
    if (!values.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RESEND_API_KEY es obligatorio en producción',
        path: ['RESEND_API_KEY'],
      })
    }
    if (values.NOTIFY_EMAIL_CONTACT === DEFAULT_NOTIFY_EMAIL_CONTACT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NOTIFY_EMAIL_CONTACT no puede usar el valor de desarrollo en producción',
        path: ['NOTIFY_EMAIL_CONTACT'],
      })
    }
    if (values.NOTIFY_EMAIL_JOBS === DEFAULT_NOTIFY_EMAIL_JOBS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NOTIFY_EMAIL_JOBS no puede usar el valor de desarrollo en producción',
        path: ['NOTIFY_EMAIL_JOBS'],
      })
    }
    if (values.EMAIL_FROM === DEFAULT_EMAIL_FROM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'EMAIL_FROM no puede usar el remitente de resend.dev en producción',
        path: ['EMAIL_FROM'],
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    'Configuración de entorno inválida:',
    parsed.error.flatten().fieldErrors,
  )
  process.exit(1)
}

export const env = parsed.data