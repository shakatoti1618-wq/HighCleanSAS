import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Seo from './Seo.tsx'

function cleanSeoHead() {
  const selectors = [
    'meta[name="description"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'link[rel="canonical"]',
    'script[data-seo-ld]',
  ]
  for (const selector of selectors) {
    document.head.querySelectorAll(selector).forEach((node) => node.remove())
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  cleanSeoHead()
})

describe('Seo', () => {
  it('actualiza title, description y meta OG', () => {
    render(<Seo title="Título" description="Descripción" />)

    expect(document.title).toBe('Título')
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe('Descripción')
    expect(
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe('Título')
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).toBe('Descripción')
  })

  it('escribe canonical y og:url absolutos con VITE_SITE_URL', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
    render(<Seo title="Título" description="Descripción" canonicalPath="/servicios" />)

    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://highclean.co/servicios')
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    ).toBe('https://highclean.co/servicios')
  })

  it('usa canonical relativa cuando no hay URL de sitio configurada', () => {
    render(<Seo title="Título" description="Descripción" canonicalPath="/contacto" />)

    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('/contacto')
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    ).toBeUndefined()
  })

  it('inyecta JSON-LD y reemplaza los bloques anteriores', () => {
    const { rerender } = render(
      <Seo title="A" description="d" jsonLd={[{ '@type': 'A' }]} />,
    )

    let scripts = document.querySelectorAll('script[data-seo-ld]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.textContent).toContain('"@type":"A"')

    rerender(
      <Seo title="B" description="d" jsonLd={[{ '@type': 'B' }]} />,
    )

    scripts = document.querySelectorAll('script[data-seo-ld]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.textContent).toContain('"@type":"B"')
  })
})