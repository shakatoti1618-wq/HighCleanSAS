export const PUBLIC_PATHS: string[]

export function normalizeSiteUrl(raw: unknown): string | null

export function isProductionValidSiteUrl(raw: unknown): boolean

export function resolveSiteUrl(
  env: { VITE_SITE_URL?: string } | undefined,
  options: { strict: boolean; fallback?: string },
): { url: string; warning: string | null }