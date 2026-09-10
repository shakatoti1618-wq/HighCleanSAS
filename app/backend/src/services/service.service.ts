import { findServices } from '../repositories/service.repository.js'

export async function getServices() {
  return findServices()
}