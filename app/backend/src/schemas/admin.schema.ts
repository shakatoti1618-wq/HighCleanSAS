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