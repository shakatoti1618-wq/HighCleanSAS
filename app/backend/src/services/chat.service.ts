import { findCompany } from '../repositories/company.repository.js'
import { findServices } from '../repositories/service.repository.js'
import type { ChatContext } from '../providers/chat.provider.js'
import { KnowledgeChatProvider } from '../providers/knowledge.chat-provider.js'

const provider = new KnowledgeChatProvider()

export async function getChatResponse(message: string): Promise<string> {
  const [company, services] = await Promise.all([findCompany(), findServices()])

  const context: ChatContext = {
    company: company
      ? {
          name: company.name,
          description: company.description,
          mission: company.mission,
          vision: company.vision,
          values: company.values,
          schedules: company.schedules,
          phone: company.phone,
          email: company.email,
          address: company.address,
          whatsappNumber: company.whatsappNumber,
        }
      : null,
    services: services.map((service) => ({
      name: service.name,
      description: service.description,
    })),
  }

  return provider.answer(message, context)
}