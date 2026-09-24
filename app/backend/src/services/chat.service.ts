import { findCompany } from '../repositories/company.repository.js'
import { findServices } from '../repositories/service.repository.js'
import type { ChatCompanyValueContext, ChatContext } from '../providers/chat.provider.js'
import { KnowledgeChatProvider } from '../providers/knowledge.chat-provider.js'

const provider = new KnowledgeChatProvider()

function toValueContexts(
  values: unknown,
): ChatCompanyValueContext[] | null {
  if (!Array.isArray(values)) return null

  const contexts: ChatCompanyValueContext[] = []

  for (const raw of values) {
    if (
      raw &&
      typeof raw === 'object' &&
      typeof (raw as { name?: unknown }).name === 'string' &&
      typeof (raw as { description?: unknown }).description === 'string'
    ) {
      contexts.push({
        name: (raw as { name: string }).name,
        description: (raw as { description: string }).description,
      })
    }
  }

  return contexts.length > 0 ? contexts : null
}

export async function getChatResponse(message: string): Promise<string> {
  const [company, services] = await Promise.all([findCompany(), findServices()])

  const context: ChatContext = {
    company: company
      ? {
          name: company.name,
          description: company.description,
          mission: company.mission,
          vision: company.vision,
          values: toValueContexts(company.values),
          schedules: company.schedules,
          phone: company.phone,
          email: company.email,
          address: company.address,
          whatsappNumber: company.whatsappNumber,
          serviceCities: company.serviceCities,
        }
      : null,
    services: services.map((service) => ({
      name: service.name,
      description: service.description,
    })),
  }

  return provider.answer(message, context)
}