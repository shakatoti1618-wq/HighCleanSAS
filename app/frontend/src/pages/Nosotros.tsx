import { useEffect, useState } from 'react'
import { Eye, Gem, Target } from 'lucide-react'
import { fetchCompany, type Company } from '../lib/api.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const sections = [
  { key: 'mission', label: 'Misión', icon: Target },
  { key: 'vision', label: 'Visión', icon: Eye },
  { key: 'values', label: 'Valores', icon: Gem },
] as const

function Nosotros() {
  const [company, setCompany] = useState<Company | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchCompany()
      .then((data) => {
        if (active) setCompany(data)
      })
      .catch(() => {
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Nosotros</h1>
      <p className="mt-2 text-slate-400">
        {error
          ? 'No se pudo cargar la información de la empresa. Intenta de nuevo más tarde.'
          : company?.description ?? TODO_TEXT}
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          const content = company?.[section.key] ?? TODO_TEXT

          return (
            <article
              key={section.key}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <Icon className="h-8 w-8 text-cyan-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-white">{section.label}</h2>
              <p className="mt-2 text-sm text-slate-400">{content}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Nosotros