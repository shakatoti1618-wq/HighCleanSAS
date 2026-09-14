import { z } from 'zod'

export const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje es demasiado largo'),
})

export type ChatInput = z.infer<typeof chatSchema>