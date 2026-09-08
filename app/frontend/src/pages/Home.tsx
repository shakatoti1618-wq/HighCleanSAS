import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-700">
        Bienvenidos a
      </p>
      <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
        High Clean SAS
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">
        Empresa de aseo y limpieza.
        Slogan y descripción: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/servicios"
          className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
        >
          Ver servicios
        </Link>
        <Link
          to="/contacto"
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:border-sky-700 hover:text-sky-700"
        >
          Contáctanos
        </Link>
      </div>
    </section>
  )
}

export default Home