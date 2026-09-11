import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { EASE } from '../lib/motion.ts'

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

function Home() {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const yDrop = useTransform(scrollYProgress, [0, 1], [0, 150])
  const yDrop2 = useTransform(scrollYProgress, [0, 1], [0, -90])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.14])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      aria-label="Presentación"
    >
      <h1 className="sr-only">High Clean SAS</h1>

      <div className="absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ y: yDrop, scale }}
        >
          <div className="absolute h-[1100px] w-[1100px] max-w-none">
            <Droplet id="drop1" />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[6%] right-[8%] h-[380px] w-[380px] max-w-none rotate-[18deg]"
          style={{ y: yDrop2 }}
        >
          <Droplet id="drop2" />
        </motion.div>
        <div className="absolute left-[6%] top-[10%] h-72 w-72 rounded-full bg-brand-lagoon/15 blur-3xl" />
        <div className="absolute bottom-[8%] left-[24%] h-80 w-80 rounded-full bg-brand-leaf/25 blur-3xl" />
        <div className="absolute right-[10%] top-[24%] h-64 w-64 rounded-full bg-brand-leafDeep/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl animate-float">
          <motion.div
            className="rounded-2xl border border-white/60 bg-white/70 px-6 py-12 text-center shadow-2xl backdrop-blur-xl md:px-14 md:py-16"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <motion.img
              src="/logo-transparente.png"
              alt="Logo High Clean SAS"
              width={533}
              height={360}
              fetchPriority="high"
              className="inline-block h-24 w-auto md:h-28"
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            />

            <motion.div
              className="my-6 inline-flex items-center rounded-sm border border-brand-turq/30 bg-brand-turq/10 px-4 py-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            >
              <span
                className="mr-2 h-2 w-2 animate-pulse rounded-full bg-brand-gold"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-brand-turqDeep">
                Limpieza · Aseo · Mantenimiento
              </span>
            </motion.div>

            <motion.h2
              className="mb-6 text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-4xl font-bold leading-[1.05] tracking-tight text-transparent md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
            >
              Espacios impecables para empresas que cuidan su imagen
            </motion.h2>

            <motion.p
              className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-slate-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.54 }}
            >
              Empresa de aseo y limpieza. Slogan y descripción: TODO:
              información pendiente de confirmar con High Clean SAS.
            </motion.p>

            <motion.div
              className="flex flex-col justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.66 }}
            >
              <Link
                to="/contacto"
                className="animate-pulse-ring rounded-sm bg-brand-turq px-8 py-4 text-center font-semibold text-white shadow-lg transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
              >
                Solicitar una cotización
              </Link>
              <Link
                to="/servicios"
                className="rounded-sm border border-brand-turq px-8 py-4 text-center font-semibold text-brand-turqDeep transition-colors hover:bg-brand-turq/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
              >
                Ver servicios
              </Link>
            </motion.div>

            <motion.dl
              className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-200/70 pt-8 text-center sm:grid-cols-4"
              aria-label="Resultados"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div>
                <dd className="stat-num font-display text-3xl font-bold text-brand-turq">
                  —
                </dd>
                <dt className="mt-1 text-sm text-slate-500">
                  clientes activos
                </dt>
              </div>
              <div>
                <dd className="stat-num font-display text-3xl font-bold text-brand-turq">
                  —
                </dd>
                <dt className="mt-1 text-sm text-slate-500">
                  años de operación
                </dt>
              </div>
              <div>
                <dd className="stat-num font-display text-3xl font-bold text-brand-turq">
                  —
                </dd>
                <dt className="mt-1 text-sm text-slate-500">
                  servicios al mes
                </dt>
              </div>
              <div>
                <dd className="stat-num font-display text-3xl font-bold text-brand-gold">
                  100%
                </dd>
                <dt className="mt-1 text-sm text-slate-500">
                  personal afiliado
                </dt>
              </div>
            </motion.dl>
          </motion.div>
        </div>
      </div>

      <div className="wave-holder relative z-10" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="fill-white/70">
          <path d="M0,48 C240,108 480,120 720,84 C960,48 1200,36 1440,72 L1440,120 L0,120 Z" />
          <path d="M0,72 C280,112 560,116 840,92 C1080,72 1260,76 1440,96 L1440,120 L0,120 Z" opacity=".5" />
        </svg>
      </div>
    </section>
  )
}

export default Home