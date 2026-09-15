import { compare } from 'bcryptjs'
import { findByEmail } from '../repositories/user.repository.js'
import { AuthenticationError } from '../utils/httpError.js'

export const BCRYPT_ROUNDS = 12

const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos'

export async function verifyCredentials(email: string, password: string) {
  const user = await findByEmail(email)

  if (!user) {
    throw new AuthenticationError(INVALID_CREDENTIALS)
  }

  const valid = await compare(password, user.passwordHash)

  if (!valid) {
    throw new AuthenticationError(INVALID_CREDENTIALS)
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
  }
}