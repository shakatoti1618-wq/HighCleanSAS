import { Sparkles } from 'lucide-react'

const placeholderServices = [
  { id: 1, title: 'Servicio 1' },
  { id: 2, title: 'Servicio 2' },
  { id: 3, title: 'Servicio 3' },
]

function Servicios() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Servicios</h1>
      <p className="mt-2 text-slate-400">
        Listado de servicios próximamente. Detalles y precios: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderServices.map((service) => (
          <article
            key={service.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Sparkles className="h-8 w-8 text-cyan-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-white">{service.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              TODO: información pendiente de confirmar con High Clean SAS.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Servicios