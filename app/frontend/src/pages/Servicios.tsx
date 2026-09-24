import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, Images, Layers, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Seo from '../components/Seo.tsx'
import { container, itemCard } from '../lib/motion.ts'
import { fetchServices, type Service, type ServiceOption } from '../lib/api.ts'
import { formatCOP } from '../lib/formatPrices.ts'
import { servicesJson } from '../lib/seo.ts'

function groupOptions(options: ServiceOption[]): {
  group: string | null
  options: ServiceOption[]
}[] {
  const grouped = new Map<string | null, ServiceOption[]>()
  for (const option of options) {
    const key = option.group
    const bucket = grouped.get(key)
    if (bucket) {
      bucket.push(option)
    } else {
      grouped.set(key, [option])
    }
  }
  return Array.from(grouped.entries()).map(([group, items]) => ({
    group,
    options: items,
  }))
}

function ServiceOptions({ service }: { service: Service }) {
  const [open, setOpen] = useState(false)

  if (service.options.length === 0) return null

  const grouped = groupOptions(service.options)

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`options-${service.id}`}
        className="flex w-full items-center justify-between rounded-sm border border-brand-turqSoft bg-white/70 px-4 py-3 text-left text-sm font-semibold text-brand-turqDeep transition-colors hover:bg-brand-turq/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq"
      >
        <span>Ver modalidades y precios</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={`options-${service.id}`}
        hidden={!open}
        className="mt-2 divide-y divide-brand-turqSoft rounded-sm border border-brand-turqSoft bg-white"
      >
        {grouped.map((entry) => (
          <div key={entry.group ?? '__sin_grupo__'} className="px-4 py-2">
            {entry.group ? (
              <p className="mb-2 mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-turqDeep">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                {entry.group}
              </p>
            ) : null}
            <ul className="divide-y divide-brand-turqSoft/50">
              {entry.options.map((option) => (
                <li key={option.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-brand-ink">
                      {option.label}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-brand-turqDeep">
                      {formatCOP(option.price)}
                    </span>
                  </div>
                  {option.note ? (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {option.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

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
    <section
      className="relative bg-white/50 py-24"
      aria-labelledby="servicios-title"
    >
      <Seo
        title="Servicios de limpieza — High Clean SAS"
        description="Servicios de aseo y limpieza profesional de High Clean SAS para todo tipo de instalaciones. Mira las modalidades y precios de cada servicio."
        canonicalPath="/servicios"
        jsonLd={
          services
            ? [servicesJson(services)].filter(
                (block): block is object => block !== null,
              )
            : []
        }
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-turqDeep" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-turqDeep">Servicios</p>
          </div>
          <h1
            id="servicios-title"
            className="text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
          >
            Servicios
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Un plan de limpieza para cada tipo de instalación. En cada servicio
            encontrarás sus modalidades y precios por jornada o mensualidad.
          </p>
        </div>

        {error ? (
          <p className="mb-8 text-slate-500">
            No se pudieron cargar los servicios. Intenta de nuevo más tarde.
          </p>
        ) : null}

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services?.map((service) => (
            <motion.article
              key={service.id}
              variants={itemCard}
              className="group flex flex-col overflow-hidden rounded-sm border border-brand-turqSoft bg-white shadow-md transition-all duration-500 hover:-translate-y-6 hover:shadow-2xl"
            >
              {service.imageUrl ? (
                <div className="relative h-44 overflow-hidden bg-brand-turq/10">
                  <img
                    src={service.imageUrl}
                    alt={`Servicio de ${service.name.toLowerCase()} de High Clean SAS`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center bg-brand-turq/10">
                  <Images className="h-10 w-10 text-brand-turq/50" aria-hidden="true" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-8 pt-6">
                <h2 className="mb-3 font-display text-lg font-semibold text-brand-ink">
                  {service.name}
                </h2>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <ServiceOptions service={service} />
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-turqDeep transition-all duration-300 hover:text-brand-turq focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq group-hover:translate-x-1"
                >
                  Cotizar este servicio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.article>
          ))}

          {services !== null && services.length === 0 && (
            <motion.div
              variants={itemCard}
              className="col-span-full flex flex-col items-center rounded-sm border border-dashed border-brand-turq/30 bg-white/60 p-12 text-center"
            >
              <MapPin
                className="h-10 w-10 text-brand-turq/50"
                aria-hidden="true"
              />
              <p className="mt-4 text-slate-600">
                Aún no hay servicios publicados. Vuelve pronto.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Servicios