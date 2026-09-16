import { z } from 'zod'

export const jobFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  position: z
    .string()
    .trim()
    .min(1, 'El cargo al que aplica es obligatorio')
    .max(100, 'El cargo no puede superar los 100 caracteres'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido')
    .max(254, 'El correo no puede superar los 254 caracteres'),
  phone: z
    .string()
    .trim()
    .regex(
      /^[+()\-\s\d]{7,20}$/,
      'Ingresa un teléfono válido (solo números, +, -, espacios y paréntesis)',
    ),
  message: z
    .string()
    .trim()
    .max(2000, 'El mensaje no puede superar los 2000 caracteres')
    .optional(),
  consent: z
    .string({ message: 'Debes autorizar el tratamiento de tus datos personales' })
    .refine(
      (value) => value === 'on' || value === 'true' || value === '1',
      'Debes autorizar el tratamiento de tus datos personales',
    ),
})

export type JobFieldsInput = z.infer<typeof jobFieldsSchema>