const sections = [
  { title: 'Misión' },
  { title: 'Visión' },
  { title: 'Valores' },
] as const

function Nosotros() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-900">Nosotros</h1>
      <p className="mt-2 text-slate-600">
        Información de la empresa: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              TODO: información pendiente de confirmar con High Clean SAS.
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Nosotros