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

type ContactPriority = 'email' | 'location' | 'general'

function contactInfo(context: ChatContext, priority: ContactPriority = 'general'): string {
  const company = context.company
  const phone = company?.phone
  const whatsapp = company?.whatsappNumber
  const email = company?.email
  const address = company?.address
  const cities = company?.serviceCities?.length ? company.serviceCities.join(', ') : null

  const parts: string[] = []

  switch (priority) {
    case 'email':
      if (email) parts.push(`Puedes enviar tu cotización a ${email}.`)
      if (whatsapp) parts.push(`También puedes escribirnos por WhatsApp al ${whatsapp}.`)
      if (phone) parts.push(`O llámanos al ${phone}.`)
      break

    case 'location':
      if (cities) parts.push(`Prestamos servicio en: ${cities}.`)
      if (address) parts.push(`Nuestra oficina está en: ${address}.`)
      if (phone) parts.push(`Teléfono: ${phone}.`)
      if (whatsapp) parts.push(`WhatsApp: ${whatsapp}.`)
      if (email) parts.push(`Correo: ${email}.`)
      break

    default:
      const channels: string[] = []
      if (phone) channels.push(`teléfono ${phone}`)
      if (whatsapp) channels.push(`WhatsApp al ${whatsapp}`)
      if (email) channels.push(`correo ${email}`)
      if (address) channels.push(`dirección: ${address}`)
      if (cities) channels.push(`Prestamos servicio en: ${cities}`)

      if (channels.length === 0) {
        return `Aún no tengo los datos de contacto confirmados. ${TO_CONTACT_HINT}`
      }
      return `Puedes contactarlos por ${channels.join(', ')}.`
  }

  return parts.join(' ')
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
      let priority: ContactPriority = 'general'
      if (hasAny(text, ['correo', 'email', 'cotizacion', 'cotizar', 'cotización', 'cotiza'])) {
        priority = 'email'
      } else if (hasAny(text, ['ubicacion', 'ubicados', 'ubicarse', 'ubicar', 'ubicada', 'ubicadas', 'encontrar', 'quedan', 'donde estan', 'donde queda', 'donde queda', 'donde esta', 'direccion', 'ubicacion'])) {
        priority = 'location'
      }
      return contactInfo(context, priority)
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
      const company = context.company
      const summary = [
        company.name,
        company.description ? company.description.split('\n')[0] : null,
        company.mission ? `Misión: ${company.mission.split('\n')[0]}` : null,
      ].filter(Boolean).join('. ')
      return `${summary}. ${TO_CONTACT_HINT}`
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