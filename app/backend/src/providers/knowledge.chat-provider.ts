import type { ChatContext, ChatProvider } from './chat.provider.js'

const TO_CONTACT_HINT =
  'Puedes escribirnos desde la página de contacto o por WhatsApp para resolverlo.'

const CONTACT_KEYWORDS = [
  'contacto',
  'contactar',
  'telefono',
  'numero',
  'correo',
  'email',
  'direccion',
  'whatsapp',
  'ubicacion',
  'ubicados',
  'ubicarse',
  'ubicar',
  'ubicada',
  'ubicadas',
  'encontrar',
  'quedan',
  'donde estan',
  'donde queda',
  'contactarlos',
  'cotizacion',
  'cotizar',
]

const PRICING_KEYWORDS = [
  'precio',
  'precios',
  'costo',
  'costos',
  'tarifa',
  'cuanto cuesta',
  'cuanto vale',
  'valor',
  'cobran',
  'cobrar',
  'pago',
  'pagos',
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function listServices(context: ChatContext): string {
  if (context.services.length === 0) {
    return `Todavía no tengo el portafolio de servicios confirmado. ${TO_CONTACT_HINT}`
  }

  return context.services
    .map((service) => {
      const base = `- ${service.name}`
      return service.description ? `${base}: ${service.description}` : base
    })
    .join('\n')
}

function listValues(context: ChatContext): string {
  const values = context.company?.values
  if (!values || values.length === 0) {
    return 'Todavía no tengo los valores confirmados.'
  }
  return values
    .map((value) => `- ${value.name}: ${value.description}`)
    .join('\n')
}

function contactInfo(context: ChatContext): string {
  const company = context.company
  const channels: string[] = []

  if (company?.phone) channels.push(`teléfono ${company.phone}`)
  if (company?.whatsappNumber)
    channels.push(`WhatsApp al ${company.whatsappNumber}`)
  if (company?.email) channels.push(`correo ${company.email}`)
  if (company?.address) channels.push(`dirección: ${company.address}`)
  if (company?.serviceCities && company.serviceCities.length > 0) {
    channels.push(`Prestamos servicio en: ${company.serviceCities.join(', ')}`)
  }

  if (channels.length === 0) {
    return `Aún no tengo los datos de contacto confirmados. ${TO_CONTACT_HINT}`
  }

  return `Puedes contactarlos por ${channels.join(', ')}.`
}

export class KnowledgeChatProvider implements ChatProvider {
  answer(message: string, context: ChatContext): string {
    const text = normalize(message)
    const companyName = context.company?.name ?? 'la empresa'

    if (
      hasAny(text, ['hola', 'holi', 'hello', 'hi ', 'buenos dias', 'buenas tardes', 'buenas noches'])
    ) {
      return `¡Hola! Soy el asistente informativo de ${companyName}. Pregúntame por sus servicios, la empresa, horarios o cómo contactarlos.`
    }

    // Contacto ANTES que precios: si el mensaje menciona contacto/cotización + palabras de contacto, prioriza contacto
    if (hasAny(text, CONTACT_KEYWORDS)) {
      return contactInfo(context)
    }

    if (hasAny(text, PRICING_KEYWORDS)) {
      return `Puedes ver los precios de nuestros servicios en la página de Servicios. Para una cotización personalizada, contáctanos por WhatsApp o el formulario de contacto.`
    }

    if (hasAny(text, ['servicio', 'servicios', 'que hacen', 'que ofrecen', 'limpieza', 'aseo', 'trabajos', 'portfolio', 'portafolio'])) {
      return `Estos son los servicios que tengo registrados de ${companyName}:\n${listServices(context)}`
    }

    if (hasAny(text, ['horario', 'horarios', 'atienden', 'abren', 'abierto', 'atencion'])) {
      if (context.company?.schedules) {
        return `El horario de atención de ${companyName} es: ${context.company.schedules}.`
      }
      return `Todavía no tengo el horario de atención confirmado. ${TO_CONTACT_HINT}`
    }

    if (
      hasAny(text, ['quien es', 'quienes son', 'empresa', 'sobre ustedes', 'high clean', 'que es'])
    ) {
      if (!context.company) {
        return `No tengo información de la empresa disponible por el momento. ${TO_CONTACT_HINT}`
      }
      const parts = [context.company.name]
      if (context.company.description) parts.push(context.company.description)
      if (context.company.mission) parts.push(`Misión: ${context.company.mission}`)
      if (context.company.vision) parts.push(`Visión: ${context.company.vision}`)
      parts.push(`Valores:\n${listValues(context)}`)
      if (parts.length === 1) {
        return `Espero poder darte más detalles de ${companyName} pronto. ${TO_CONTACT_HINT}`
      }
      return parts.join('\n')
    }

    if (hasAny(text, ['gracias', 'muchas gracias'])) {
      return `¡Con gusto! Si necesitas algo más, aquí estoy.`
    }

    if (hasAny(text, ['adios', 'chao', 'hasta luego', 'nos vemos'])) {
      return `¡Hasta luego! Recuerda que si necesitas información adicional puedes contactar directamente a ${companyName}.`
    }

    return `Lo siento, no tengo información sobre eso. ${TO_CONTACT_HINT}`
  }
}