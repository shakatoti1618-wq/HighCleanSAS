const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const videoExtensions = new Set(['.mp4', '.webm'])

export type MediaType = 'IMAGE' | 'VIDEO'

export function extnameOf(name: string): string | null {
  const last = name.lastIndexOf('.')
  if (last < 0 || last === name.length - 1) return null
  return name.slice(last).toLowerCase()
}

export function isImageExtension(name: string): boolean {
  const ext = extnameOf(name)
  return ext !== null && imageExtensions.has(ext)
}

export function isVideoExtension(name: string): boolean {
  const ext = extnameOf(name)
  return ext !== null && videoExtensions.has(ext)
}

export function mediaTypeOf(name: string): MediaType | null {
  const ext = extnameOf(name)
  if (ext !== null && imageExtensions.has(ext)) return 'IMAGE'
  if (ext !== null && videoExtensions.has(ext)) return 'VIDEO'
  return null
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function safeObjectKey(name: string): string {
  const basename = name.split(/[\\/]/).pop() ?? 'archivo'
  const cleaned = basename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!cleaned) return 'archivo'
  return cleaned
}

export const IMAGE_EXTENSIONS_LABEL = 'jpg, jpeg, png, webp'
export const MEDIA_EXTENSIONS_LABEL = 'jpg, jpeg, png, webp, mp4, webm'