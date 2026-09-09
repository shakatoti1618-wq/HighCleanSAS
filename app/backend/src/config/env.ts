import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL es obligatorio (ver .env / .env.example)'),
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