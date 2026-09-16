import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion.ts'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/servicios', label: 'Servicios' },
  { to: '/galeria', label: 'Galería' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

const secondaryLinks = [
  { to: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' },
  { to: '/politica-de-datos', label: 'Política de datos' },
]

function navLinkClass(isActive: boolean) {
  return isActive
    ? 'text-sm font-medium text-brand-turqDeep underline underline-offset-4'
    : 'text-sm font-medium text-slate-600 transition-colors hover:text-brand-turqDeep'
}

function secondaryLinkClass(isActive: boolean) {
  return isActive
    ? 'text-xs font-medium text-brand-turqDeep underline underline-offset-4'
    : 'text-xs font-medium text-slate-500 transition-colors hover:text-brand-turqDeep'
}

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm"
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <Link
          to="/"
          className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
          aria-label="High Clean SAS, inicio"
        >
          <img
            src="/logo-transparente.png"
            alt="Logo High Clean SAS"
            width={533}
            height={360}
            loading="lazy"
            className="h-12 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            to="/contacto"
            className="hidden rounded-sm bg-brand-turq px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 md:inline-flex"
          >
            Cotizar
          </Link>
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className="rounded-sm text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <div className="hidden border-t border-slate-100 bg-white/80 md:block">
        <nav
          className="mx-auto flex max-w-7xl items-center gap-7 px-4 py-2 sm:px-6 lg:px-8"
          aria-label="Navegación secundaria"
        >
          {secondaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => secondaryLinkClass(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white/95 px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/contacto"
                onClick={() => setOpen(false)}
                className="inline-flex rounded-sm bg-brand-turq px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep"
              >
                Cotizar
              </Link>
            </li>
            <li
              className="border-t border-slate-100 pt-3"
              aria-hidden="true"
            />
            {secondaryLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => secondaryLinkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.header>
  )
}

export default Navbar