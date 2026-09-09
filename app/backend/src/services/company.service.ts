import { findCompany } from '../repositories/company.repository.js'
import { NotFoundError } from '../utils/httpError.js'

export async function getCompany() {
  const company = await findCompany()

  if (!company) {
    throw new NotFoundError('Información de la empresa no disponible')
  }

  return company
}