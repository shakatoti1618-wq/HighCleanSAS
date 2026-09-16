import { useEffect } from 'react'
import { absoluteUrl } from '../lib/seo.ts'

interface SeoProps {
  title: string
  description: string
  canonicalPath?: string
  jsonLd?: readonly object[]
}

const LD_SCRIPT_ATTR = 'data-seo-ld'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function syncJsonLd(blocks: object[]) {
  document.head
    .querySelectorAll<HTMLScriptElement>(`script[${LD_SCRIPT_ATTR}]`)
    .forEach((script) => script.remove())

  for (const block of blocks) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(LD_SCRIPT_ATTR, '')
    script.textContent = JSON.stringify(block)
    document.head.appendChild(script)
  }
}

function Seo({ title, description, canonicalPath, jsonLd = [] }: SeoProps) {
  const jsonLdKey = JSON.stringify(jsonLd)

  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)

    if (canonicalPath) {
      const canonicalUrl = absoluteUrl(canonicalPath)
      upsertCanonical(canonicalUrl ?? canonicalPath)
      if (canonicalUrl) {
        upsertMeta('property', 'og:url', canonicalUrl)
      }
    }

    syncJsonLd(JSON.parse(jsonLdKey) as object[])

    return () => {
      document.head
        .querySelectorAll<HTMLScriptElement>(`script[${LD_SCRIPT_ATTR}]`)
        .forEach((script) => script.remove())
    }
  }, [title, description, canonicalPath, jsonLdKey])

  return null
}

export default Seo