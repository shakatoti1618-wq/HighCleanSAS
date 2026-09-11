function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative z-10 border-t border-slate-100 bg-white/70 py-12"
      aria-label="Pie de página"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-slate-100 pb-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-transparente.png"
              alt=""
              width={533}
              height={360}
              loading="lazy"
              className="h-10 w-auto"
            />
            <span className="font-display text-lg font-bold tracking-tight text-brand-ink">
              High Clean<span className="text-brand-turqDeep">SAS</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Redes sociales y otros datos: TODO: información pendiente de
            confirmar con High Clean SAS.
          </p>
        </div>
        <p className="pt-8 text-sm text-slate-500">
          © {year} High Clean SAS. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer