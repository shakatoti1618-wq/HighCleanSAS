import { useEffect, useState } from 'react'
import { ArrowRight, Eye, Gem, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion.ts'
import { fetchCompany, type Company } from '../lib/api.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const sections = [
  { key: 'mission', label: 'Misión', icon: Target },
  { key: 'vision', label: 'Visión', icon: Eye },
  { key: 'values', label: 'Valores', icon: Gem },
] as const

function Droplet({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full opacity-10"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2E8292" />
          <stop offset="1" stopColor="#749D5B" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 1.6C16 7 21 11.4 21 16.2a9 9 0 1 1-18 0C3 11.4 8 7 12 1.6z"
      />
    </svg>
  )
}

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
    <section
      className="relative bg-white/30 py-24"
      aria-labelledby="nosotros-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-brand-turqDeep" aria-hidden="true" />
              <p className="text-sm font-medium text-brand-turqDeep">Nosotros</p>
            </div>
            <h1
              id="nosotros-title"
              className="mb-6 text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
            >
              Nosotros
            </h1>
            <p className="mb-7 leading-relaxed text-slate-600">
              {error
                ? 'No se pudo cargar la información de la empresa. Intenta de nuevo más tarde.'
                : (company?.description ?? TODO_TEXT)}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon
                const content = company?.[section.key] ?? TODO_TEXT

                return (
                  <article
                    key={section.key}
                    className="group rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl focus-within:ring-2 focus-within:ring-brand-turq focus-within:ring-offset-2"
                  >
                    <span
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-brand-turq/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                      aria-hidden="true"
                    >
                      <Icon className="h-6 w-6 text-brand-turqDeep" />
                    </span>
                    <h2 className="mb-2 font-display text-lg font-semibold text-brand-ink">
                      {section.label}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {content}
                    </p>
                  </article>
                )
              })}
            </div>

            <Link
              to="/galeria"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-brand-turq px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
            >
              Ver galería
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.figure
            className="relative"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex h-96 w-full items-center justify-center overflow-hidden rounded-sm bg-brand-turqSoft/40">
              <div className="h-72 w-72 max-w-none">
                <Droplet id="drop-nosotros" />
              </div>
            </div>
            <motion.figcaption
              className="absolute -bottom-5 -left-5 rounded-sm bg-brand-gold px-6 py-4 shadow-xl"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            >
              <span className="stat-num block font-display text-2xl font-bold text-brand-ink">
                100%
              </span>
              <span className="text-sm font-medium text-brand-ink">
                personal afiliado
              </span>
            </motion.figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  )
}

export default Nosotros