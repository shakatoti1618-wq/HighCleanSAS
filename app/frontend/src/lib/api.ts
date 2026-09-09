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

export async function fetchCompany(): Promise<Company> {
  const response = await fetch('/api/v1/company')

  if (!response.ok) {
    throw new Error('No se pudo obtener la información de la empresa')
  }

  return response.json() as Promise<Company>
}