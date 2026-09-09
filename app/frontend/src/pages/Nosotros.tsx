import { Eye, Gem, Target } from 'lucide-react'

const sections = [
  { title: 'Misión', icon: Target },
  { title: 'Visión', icon: Eye },
  { title: 'Valores', icon: Gem },
] as const

function Nosotros() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Nosotros</h1>
      <p className="mt-2 text-slate-400">
        Información de la empresa: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <article
              key={section.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <Icon className="h-8 w-8 text-cyan-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-400">
                TODO: información pendiente de confirmar con High Clean SAS.
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Nosotros