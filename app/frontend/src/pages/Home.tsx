import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-400">
        Bienvenidos a
      </p>
      <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
        High Clean SAS
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-400">
        Empresa de aseo y limpieza.
        Slogan y descripción: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/servicios"
          className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
        >
          Ver servicios
        </Link>
        <Link
          to="/contacto"
          className="rounded-lg border border-slate-800 px-6 py-3 font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          Contáctanos
        </Link>
      </div>
      <p className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500">
        <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden="true" />
        Pulcritud y tecnología al servicio de tu espacio
      </p>
    </section>
  )
}

export default Home