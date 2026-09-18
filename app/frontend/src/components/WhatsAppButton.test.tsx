import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WhatsAppButton from './WhatsAppButton.tsx'
import { resetCompanyCache } from '../hooks/useCompany.ts'
import type { Company } from '../lib/api.ts'

const baseCompany: Company = {
  id: '13d5c1ef-3b57-4c18-9f0a-93d7b3e5c001',
  name: 'High Clean SAS',
  description: null,
  mission: null,
  vision: null,
  qualityPolicy: null,
  values: null,
  phone: null,
  whatsappNumber: null,
  email: null,
  address: null,
  schedules: null,
  serviceCities: null,
}

function stubCompany(whatsappNumber: string | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...baseCompany,
        whatsappNumber,
      }),
    }),
  )
}

describe('WhatsAppButton', () => {
  beforeEach(() => {
    resetCompanyCache()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetCompanyCache()
  })

  it('muestra el enlace a wa.me cuando hay número configurado', async () => {
    stubCompany('573001234567')

    render(<WhatsAppButton />)

    const link = await screen.findByRole('link', {
      name: /contactar por whatsapp/i,
    })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/573001234567\?text=/))
  })

  it('no renderiza nada cuando no hay número configurado', async () => {
    stubCompany(null)

    render(<WhatsAppButton />)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(
      screen.queryByRole('link', { name: /contactar por whatsapp/i }),
    ).not.toBeInTheDocument()
  })

  it('conserva los caracteres no numéricos fuera del enlace', async () => {
    stubCompany('+57 300 1234567')

    render(<WhatsAppButton />)

    const link = await screen.findByRole('link', {
      name: /contactar por whatsapp/i,
    })
    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(/https:\/\/wa\.me\/573001234567\?text=/),
    )
  })
})