import { Resend } from 'resend'
import { env } from '../config/env.js'
import type { EmailMessage, EmailProvider } from './email.provider.js'

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend | null

  constructor() {
    this.resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.resend) {
      return
    }

    await this.resend.emails.send({
      from: `High Clean SAS <${env.EMAIL_FROM}>`,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
  }
}