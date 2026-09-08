function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {year} High Clean SAS. Todos los derechos reservados.</p>
        <p>Redes sociales y otros datos: TODO: información pendiente de confirmar con High Clean SAS.</p>
      </div>
    </footer>
  )
}

export default Footer