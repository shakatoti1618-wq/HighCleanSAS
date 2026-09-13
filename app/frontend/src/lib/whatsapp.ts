export const WHATSAPP_DEFAULT_MESSAGE =
  'Hola High Clean SAS, quisiera información.'

export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string = WHATSAPP_DEFAULT_MESSAGE,
): string | null {
  const digits = whatsappNumber.replace(/[^0-9]/g, '')

  if (digits.length === 0) return null

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}