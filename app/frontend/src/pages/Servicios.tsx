import { useEffect, useState } from 'react'
import { ArrowRight, Brush, Building2, Images, Sparkles, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { container, itemCard } from '../lib/motion.ts'
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
    <section
      className="relative bg-white/50 py-24"
      aria-labelledby="servicios-title"
    >
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
            Un plan de limpieza para cada tipo de instalación. Detalles y
            precios: {TODO_TEXT}
          </p>
        </div>

        <p className="mb-8 text-slate-500">
          {error
            ? 'No se pudieron cargar los servicios. Intenta de nuevo más tarde.'
            : null}
        </p>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services?.map((service, index) => {
            const Icon = ICONS[index % ICONS.length] ?? Sparkles

            return (
              <motion.article
                key={service.id}
                variants={itemCard}
                className="group flex cursor-pointer flex-col rounded-sm border border-brand-turqSoft bg-white p-8 shadow-md transition-all duration-500 hover:-translate-y-6 hover:scale-105 hover:shadow-2xl focus-within:ring-2 focus-within:ring-brand-turq focus-within:ring-offset-2"
              >
                <span
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-sm bg-brand-turq/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6 text-brand-turqDeep" />
                </span>
                <h2 className="mb-3 font-display text-lg font-semibold text-brand-ink">
                  {service.name}
                </h2>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.description ?? TODO_TEXT}
                </p>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-turqDeep transition-all duration-300 hover:text-brand-turq focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq group-hover:translate-x-1"
                >
                  Cotizar este servicio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.article>
            )
          })}

          {services !== null && services.length === 0 && (
            <motion.div
              variants={itemCard}
              className="col-span-full flex flex-col items-center rounded-sm border border-dashed border-brand-turq/30 bg-white/60 p-12 text-center"
            >
              <Images
                className="h-10 w-10 text-brand-turq/50"
                aria-hidden="true"
              />
              <p className="mt-4 text-slate-600">{TODO_TEXT}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Servicios