import { describe, expect, it } from 'vitest'
import { ResendEmailProvider } from './providers/resend.email-provider.js'
import {
  notifyContactMessage,
  notifyJobApplication,
} from './services/notification.service.js'

describe('Notificaciones por correo', () => {
  it('no envía y no falla cuando no hay RESEND_API_KEY', async () => {
    const provider = new ResendEmailProvider()

    await expect(
      provider.send({
        to: 'test@example.com',
        subject: 'Prueba',
        text: 'Contenido',
      }),
    ).resolves.toBeUndefined()
  })

  it('notifyContactMessage y notifyJobApplication resuelven sin lanzar', async () => {
    await expect(
      notifyContactMessage({
        name: 'Cliente',
        email: 'cliente@example.com',
        message: 'Hola',
      }),
    ).resolves.toBeUndefined()

    await expect(
      notifyJobApplication({
        name: 'Postulante',
        position: 'Aseador',
        email: 'p@example.com',
        phone: '3001234567',
        message: null,
      }),
    ).resolves.toBeUndefined()
  })
})