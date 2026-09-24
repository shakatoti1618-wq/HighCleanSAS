export interface CompanyValue {
  name: string
  description: string
}

export interface Company {
  id: string
  name: string
  nit: string | null
  description: string | null
  mission: string | null
  vision: string | null
  qualityPolicy: string | null
  values: CompanyValue[] | null
  phone: string | null
  whatsappNumber: string | null
  email: string | null
  address: string | null
  schedules: string | null
  serviceCities: string[] | null
  activeClients: number | null
  yearsOperating: number | null
  monthlyServices: number | null
}

export interface ServiceOption {
  id: string
  label: string
  price: number
  note: string | null
  group: string | null
  sortOrder: number
}

export interface Service {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  companyId: string
  options: ServiceOption[]
}

export interface GalleryImage {
  id: string
  url: string
  alt: string | null
  type: 'IMAGE' | 'VIDEO'
  companyId: string
  createdAt: string
}

export interface Review {
  id: string
  author: string
  content: string
  rating: number
  status: 'APPROVED'
  companyId: string
  createdAt: string
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  const response = await fetch('/api/v1/reviews')

  if (!response.ok) {
    throw new Error('No se pudieron cargar las reseñas')
  }

  return response.json() as Promise<Review[]>
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

export interface ContactMessageInput {
  name: string
  email: string
  message: string
  website?: string
}

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<void> {
  const response = await fetch('/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      detail?.error?.message ?? 'No se pudo enviar el mensaje de contacto',
    )
  }
}

export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      detail?.error?.message ?? 'No se pudo obtener una respuesta del asistente',
    )
  }

  const data = (await response.json()) as { response: string }
  return data.response
}