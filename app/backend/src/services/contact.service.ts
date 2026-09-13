import { findCompany } from '../repositories/company.repository.js'
import { createContactMessage } from '../repositories/contact.repository.js'
import type { ContactInput } from '../schemas/contact.schema.js'
import { ConflictError } from '../utils/httpError.js'

export async function registerContactMessage(input: ContactInput) {
  const company = await findCompany()

  if (!company) {
    // TODO: revisar el código de error correcto para "empresa no configurada".
    // No es un error real de la BD: la BD respondió bien; solo falta ejecutar
    // el seed (prisma/seed.ts) que crea la empresa. Un 409 (ConflictError)
    // evita el 500 genérico y permite decidir el código definitivo más adelante.
    throw new ConflictError('La empresa aún no está configurada')
  }

  return createContactMessage(input.name, input.email, input.message, company.id)
}