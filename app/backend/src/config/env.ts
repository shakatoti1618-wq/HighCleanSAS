import 'dotenv/config'
import { z } from 'zod'

const DEFAULT_SESSION_SECRET = 'highclean-dev-session-secret-change-me-123'
const DEFAULT_ADMIN_PASSWORD = 'change-me-admin-password-2026'

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGIN: z.string().default('*'),
    SESSION_SECRET: z.string().min(32).default(DEFAULT_SESSION_SECRET),
    ADMIN_EMAIL: z.string().email().default('admin@highclean.local'),
    ADMIN_PASSWORD: z.string().min(12).default(DEFAULT_ADMIN_PASSWORD),
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