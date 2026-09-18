import { env } from '../config/env.js'
import { ResendEmailProvider } from '../providers/resend.email-provider.js'
import type { EmailProvider } from '../providers/email.provider.js'

const ADMIN_PANEL_PATH = '/admin'

export interface ContactNotificationData {
  name: string
  email: string
  message: string
}

export interface ApplicationNotificationData {
  name: string
  position: string
  email: string
  phone: string
  message?: string | null
}

const provider: EmailProvider = new ResendEmailProvider()

async function sendNotification(
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  try {
    await provider.send({ to, subject, text })
  } catch (error) {
    console.warn(
      `Notificación de correo omitida (${subject}). El registro ya se guardó en la BD y la respuesta al usuario prosigue. Motivo: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}

export function notifyContactMessage(message: ContactNotificationData) {
  return sendNotification(
    env.NOTIFY_EMAIL_CONTACT,
    'Nuevo mensaje del sitio — High Clean SAS',
    [
      'Nuevo mensaje recibido desde el formulario de contacto del sitio web:',
      '',
      `Remitente: ${message.name} (${message.email})`,
      `Mensaje: ${message.message}`,
      '',
      `Revisa el panel de administración: ${ADMIN_PANEL_PATH}`,
    ].join('\n'),
  )
}

export function notifyJobApplication(application: ApplicationNotificationData) {
  const lines = [
    'Nueva postulación recibida en el sitio web:',
    '',
    `Nombre: ${application.name}`,
    `Cargo al que aplica: ${application.position}`,
    `Correo: ${application.email}`,
    `Teléfono: ${application.phone}`,
  ]
  if (application.message) {
    lines.push(`Mensaje: ${application.message}`)
  }
  lines.push('', `Revisa el panel de administración: ${ADMIN_PANEL_PATH}`)
  lines.push('La hoja de vida solo está disponible de forma segura en el panel.')

  return sendNotification(
    env.NOTIFY_EMAIL_JOBS,
    'Nueva postulación — High Clean SAS',
    lines.join('\n'),
  )
}