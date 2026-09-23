import { compare, hashSync } from 'bcryptjs'
import {
  findById,
  findByEmail,
  updatePassword,
} from '../repositories/user.repository.js'
import {
  AuthenticationError,
  NotFoundError,
} from '../utils/httpError.js'

export const BCRYPT_ROUNDS = 12

const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos'
const WRONG_CURRENT_PASSWORD = 'La contraseña actual es incorrecta'

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

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await findById(userId)

  if (!user) {
    throw new NotFoundError('Usuario no encontrado')
  }

  const valid = await compare(currentPassword, user.passwordHash)

  if (!valid) {
    throw new AuthenticationError(WRONG_CURRENT_PASSWORD)
  }

  await updatePassword(user.id, hashSync(newPassword, BCRYPT_ROUNDS))
}