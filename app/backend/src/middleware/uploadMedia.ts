import multer from 'multer'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ValidationError } from '../utils/httpError.js'
import {
  IMAGE_EXTENSIONS_LABEL,
  MEDIA_EXTENSIONS_LABEL,
  isImageExtension,
  isVideoExtension,
} from '../utils/media.js'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_MEDIA_SIZE = 25 * 1024 * 1024

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 10,
  },
  fileFilter: (_req, file, callback) => {
    const isValid =
      isImageExtension(file.originalname) &&
      file.mimetype.startsWith('image/')

    if (!isValid) {
      const error = new Error(
        `Solo se permiten imágenes (${IMAGE_EXTENSIONS_LABEL})`,
      ) as Error & { code?: string }
      error.code = 'IMAGE_ONLY'
      callback(error)
      return
    }
    callback(null, true)
  },
})

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_MEDIA_SIZE,
    files: 1,
    fields: 10,
  },
  fileFilter: (_req, file, callback) => {
    const extOk =
      isImageExtension(file.originalname) || isVideoExtension(file.originalname)
    const mimeOk =
      file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')

    if (!extOk || !mimeOk) {
      const error = new Error(
        `Solo se permiten archivos ${MEDIA_EXTENSIONS_LABEL}`,
      ) as Error & { code?: string }
      error.code = 'MEDIA_ONLY'
      callback(error)
      return
    }
    callback(null, true)
  },
})

interface UploadMessages {
  field: string
  maxSizeMessage: string
}

function toValidationError(error: unknown, messages: UploadMessages): Error {
  const code =
    error instanceof Error ? (error as Error & { code?: string }).code : undefined

  if (code === 'IMAGE_ONLY' || code === 'MEDIA_ONLY') {
    return new ValidationError(error instanceof Error ? error.message : 'Archivo no permitido')
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError(messages.maxSizeMessage)
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return new ValidationError(
        `Solo se permite adjuntar un archivo (el campo debe llamarse "${messages.field}")`,
      )
    }
    return new ValidationError(`Archivo no válido: ${error.message}`)
  }

  return error instanceof Error ? error : new Error(String(error))
}

function handleUpload(
  middleware: RequestHandler,
  messages: UploadMessages,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (error?: unknown) => {
      if (error) {
        next(toValidationError(error, messages))
        return
      }
      next()
    })
  }
}

export const uploadServicePhoto = handleUpload(imageUpload.single('file'), {
  field: 'file',
  maxSizeMessage: 'La imagen no puede superar los 10 MB',
})

export const uploadGalleryMedia = handleUpload(mediaUpload.single('file'), {
  field: 'file',
  maxSizeMessage: 'El archivo no puede superar los 25 MB',
})