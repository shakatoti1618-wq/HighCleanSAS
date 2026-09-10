export interface Company {
  id: string
  name: string
  description: string | null
  mission: string | null
  vision: string | null
  values: string | null
  phone: string | null
  email: string | null
  address: string | null
  schedules: string | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  companyId: string
}

export interface GalleryImage {
  id: string
  url: string
  alt: string | null
  companyId: string
  createdAt: string
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const response = await fetch('/api/v1/gallery')

  if (!response.ok) {
    throw new Error('No se pudieron cargar las imágenes')
  }

  return response.json() as Promise<GalleryImage[]>
}

export async function fetchServices(): Promise<Service[]> {
  const response = await fetch('/api/v1/services')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los servicios')
  }

  return response.json() as Promise<Service[]>
}

export async function fetchCompany(): Promise<Company> {
  const response = await fetch('/api/v1/company')

  if (!response.ok) {
    throw new Error('No se pudo obtener la información de la empresa')
  }

  return response.json() as Promise<Company>
}