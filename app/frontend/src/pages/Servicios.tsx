const placeholderServices = [
  { id: 1, title: 'Servicio 1' },
  { id: 2, title: 'Servicio 2' },
  { id: 3, title: 'Servicio 3' },
]

function Servicios() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-900">Servicios</h1>
      <p className="mt-2 text-slate-600">
        Listado de servicios próximamente. Detalles y precios: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderServices.map((service) => (
          <article
            key={service.id}
            className="rounded-xl border border-slate-200 p-6 transition hover:border-sky-600 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-800">{service.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              TODO: información pendiente de confirmar con High Clean SAS.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Servicios