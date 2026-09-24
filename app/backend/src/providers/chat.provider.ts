export interface ChatCompanyValueContext {
  name: string
  description: string
}

export interface ChatCompanyContext {
  name: string
  description: string | null
  mission: string | null
  vision: string | null
  values: ChatCompanyValueContext[] | null
  schedules: string | null
  phone: string | null
  email: string | null
  address: string | null
  whatsappNumber: string | null
  serviceCities: string[] | null
}

export interface ChatServiceContext {
  name: string
  description: string | null
}

export interface ChatContext {
  company: ChatCompanyContext | null
  services: ChatServiceContext[]
}

export interface ChatProvider {
  answer(message: string, context: ChatContext): string
}