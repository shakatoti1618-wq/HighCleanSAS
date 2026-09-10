import { useEffect, useState } from 'react'
import { Brush, Building2, Sparkles, Wind } from 'lucide-react'
import { fetchServices, type Service } from '../lib/api.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const ICONS = [Sparkles, Wind, Brush, Building2]

function Servicios() {
  const [services, setServices] = useState<Service[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchServices()
      .then((data) => {
        if (active) setServices(data)
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
      <h1 className="text-3xl font-extrabold text-white">Servicios</h1>
      <p className="mt-2 text-slate-400">
        {error
          ? 'No se pudieron cargar los servicios. Intenta de nuevo más tarde.'
          : `Listado de servicios. Detalles y precios: ${TODO_TEXT}`}
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services?.map((service, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Sparkles

          return (
            <article
              key={service.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <Icon className="h-8 w-8 text-cyan-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-white">{service.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {service.description ?? TODO_TEXT}
              </p>
            </article>
          )
        })}
        {services !== null && services.length === 0 && (
          <p className="col-span-full text-slate-500">{TODO_TEXT}</p>
        )}
      </div>
    </section>
  )
}

export default Servicios