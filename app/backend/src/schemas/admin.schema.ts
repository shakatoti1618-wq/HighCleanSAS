import { z } from 'zod'
import type { ReviewStatus } from '../generated/prisma/client.js'

export const companyValueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del valor es obligatorio')
    .max(80, 'El nombre del valor no puede superar los 80 caracteres'),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción del valor es obligatoria')
    .max(400, 'La descripción del valor no puede superar los 400 caracteres'),
})

export const updateCompanySchema = z
  .object({
    nit: z
      .string()
      .trim()
      .regex(
        /^\d{6,15}-\d$/,
        'El NIT debe tener el formato 901330960-1 (dígitos, guion, dígito de verificación)',
      )
      .optional(),
    description: z.string().trim().max(5000, 'Máximo 5000 caracteres').optional(),
    mission: z.string().trim().max(5000, 'Máximo 5000 caracteres').optional(),
    vision: z.string().trim().max(5000, 'Máximo 5000 caracteres').optional(),
    qualityPolicy: z
      .string()
      .trim()
      .max(5000, 'Máximo 5000 caracteres')
      .optional(),
    slogan: z.string().trim().max(200, 'Máximo 200 caracteres').optional(),
    values: z
      .array(companyValueSchema)
      .min(1, 'Agrega al menos un valor')
      .max(20, 'Máximo 20 valores')
      .optional(),
    phone: z
      .string()
      .trim()
      .max(30, 'Máximo 30 caracteres')
      .regex(
        /^[+()\-\s\d]*$/,
        'El teléfono solo puede contener números, +, -, espacios y paréntesis',
      )
      .optional(),
    whatsappNumber: z
      .string()
      .trim()
      .max(30, 'Máximo 30 caracteres')
      .regex(
        /^[+()\-\s\d]*$/,
        'El número de WhatsApp solo puede contener números, +, -, espacios y paréntesis',
      )
      .optional(),
    serviceCities: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'El nombre de una ciudad no puede estar vacío')
          .max(80, 'El nombre de una ciudad no puede superar los 80 caracteres'),
      )
      .min(1, 'Agrega al menos una ciudad de cobertura')
      .max(20, 'Máximo 20 ciudades')
      .optional(),
    email: z.string().trim().email('Ingresa un correo válido').optional(),
    address: z.string().trim().max(300, 'Máximo 300 caracteres').optional(),
    schedules: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
    activeClients: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser menor que 0')
      .max(999999, 'Valor demasiado alto')
      .optional(),
    yearsOperating: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser menor que 0')
      .max(120, 'Valor demasiado alto')
      .optional(),
    monthlyServices: z
      .number()
      .int('Debe ser un número entero')
      .min(0, 'No puede ser menor que 0')
      .max(999999, 'Valor demasiado alto')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Enviar al menos un campo para actualizar',
  })

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del servicio es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(2000, 'La descripción no puede superar los 2000 caracteres')
    .optional(),
})

export const updateServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre del servicio es obligatorio')
      .max(100, 'El nombre no puede superar los 100 caracteres')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'La descripción no puede superar los 2000 caracteres')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Enviar al menos un campo para actualizar',
  })

const reviewStatusValues = ['PENDING', 'APPROVED', 'REJECTED'] as const

export const reviewStatusSchema = z.object({
  status: z.enum(reviewStatusValues),
})

export type UpdateReviewStatusInput = {
  status: ReviewStatus
}

export const createGalleryImageSchema = z.object({
  url: z.string().trim().url('Ingresa una URL válida').max(2000, 'URL demasiado larga'),
  alt: z
    .string()
    .trim()
    .max(300, 'El texto alternativo no puede superar los 300 caracteres')
    .optional(),
})

export const galleryUploadSchema = z.object({
  alt: z
    .string()
    .trim()
    .max(300, 'El texto alternativo no puede superar los 300 caracteres')
    .optional(),
})

const serviceOptionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'El nombre de la modalidad es obligatorio')
    .max(100, 'El nombre de la modalidad no puede superar los 100 caracteres'),
  price: z
    .number()
    .int('El precio debe ser un número entero')
    .min(0, 'El precio no puede ser negativo')
    .max(100000000, 'El precio es demasiado alto'),
  note: z
    .string()
    .trim()
    .max(300, 'La nota no puede superar los 300 caracteres')
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  group: z
    .string()
    .trim()
    .max(80, 'El grupo no puede superar los 80 caracteres')
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  sortOrder: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .max(1000, 'El orden es demasiado alto'),
})

export const serviceOptionsSchema = z.object({
  options: z
    .array(serviceOptionSchema)
    .min(1, 'Agrega al menos una modalidad')
    .max(50, 'Máximo 50 modalidades por servicio'),
})