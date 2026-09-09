import { Link, NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"
        aria-label="NavegaciÃ³n principal"
      >
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          High Clean
        </Link>
        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'font-semibold text-cyan-400 underline underline-offset-4'
                    : 'text-slate-400 hover:text-cyan-300'
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar