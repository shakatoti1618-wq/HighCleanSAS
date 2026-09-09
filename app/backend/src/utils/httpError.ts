export class AppError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super(message, 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Error de base de datos') {
    super(message, 500)
  }
}