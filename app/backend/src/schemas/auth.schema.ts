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

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 12 caracteres e incluir letras y números'

export const passwordSchema = z
  .string()
  .min(1, 'La contraseña es requerida')
  .min(12, PASSWORD_POLICY_MESSAGE)
  .regex(/[A-Za-z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[0-9]/, PASSWORD_POLICY_MESSAGE)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: passwordSchema,
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>