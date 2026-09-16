import multer from 'multer'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ValidationError } from '../utils/httpError.js'

const MAX_RESUME_SIZE = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 20,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      const error = new Error('La hoja de vida debe ser un archivo PDF') as Error & {
        code?: string
      }
      error.code = 'PDF_ONLY'
      callback(error)
      return
    }
    callback(null, true)
  },
})

function isMulterError(error: unknown): error is multer.MulterError {
  return error instanceof multer.MulterError
}

function toValidationError(error: unknown): Error {
  if (error instanceof Error && error.message === 'La hoja de vida debe ser un archivo PDF') {
    return new ValidationError(error.message)
  }

  if (isMulterError(error)) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError('La hoja de vida no puede superar los 5 MB')
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return new ValidationError('Solo se permite adjuntar un archivo (el campo debe llamarse "cv")')
    }
    return new ValidationError(`Archivo no válido: ${error.message}`)
  }

  return error instanceof Error ? error : new Error(String(error))
}

function handleUpload(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (error?: unknown) => {
      if (error) {
        next(toValidationError(error))
        return
      }
      next()
    })
  }
}

export const uploadResume = handleUpload(upload.single('cv'))