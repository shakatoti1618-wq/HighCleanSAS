import { describe, expect, it } from 'vitest'
import { buildWhatsAppUrl } from './whatsapp.ts'

describe('buildWhatsAppUrl', () => {
  it('construye el enlace estándar de wa.me', () => {
    expect(buildWhatsAppUrl('573001234567', 'Hola')).toBe(
      'https://wa.me/573001234567?text=Hola',
    )
  })

  it('limpia símbolos no numéricos del número', () => {
    expect(buildWhatsAppUrl('+57 300-1234567', 'Hola')).toBe(
      'https://wa.me/573001234567?text=Hola',
    )
  })

  it('devuelve null si el número no tiene dígitos', () => {
    expect(buildWhatsAppUrl('---')).toBeNull()
  })
})