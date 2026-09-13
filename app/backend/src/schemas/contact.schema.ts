import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido')
    .max(254, 'El correo no puede superar los 254 caracteres'),
  message: z
    .string()
    .trim()
    .min(1, 'El mensaje es obligatorio')
    .max(5000, 'El mensaje no puede superar los 5000 caracteres'),
})

export type ContactInput = z.infer<typeof contactSchema>