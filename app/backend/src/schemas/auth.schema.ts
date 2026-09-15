import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo es requerido')
    .email('El correo es inválido')
    .toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type LoginInput = z.infer<typeof loginSchema>