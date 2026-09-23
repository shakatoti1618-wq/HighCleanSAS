import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Building2,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Star,
  UserRound,
} from 'lucide-react'
import type { AuthUser } from '../lib/auth.ts'
import { logout } from '../lib/auth.ts'

const navItems = [
  { to: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/empresa', label: 'Empresa', icon: Building2 },
  { to: '/admin/servicios', label: 'Servicios', icon: MessageSquareText },
  { to: '/admin/resenas', label: 'Reseñas', icon: Star },
  { to: '/admin/mensajes', label: 'Mensajes', icon: Inbox },
  { to: '/admin/galeria', label: 'Galería', icon: Images },
  { to: '/admin/postulaciones', label: 'Postulaciones', icon: FileText },
  { to: '/admin/cuenta', label: 'Cuenta', icon: UserRound },
] as const

function navLinkClass(isActive: boolean) {
  return isActive
    ? 'flex items-center gap-3 rounded-sm bg-brand-turq/15 px-3.5 py-2.5 text-sm font-semibold text-brand-turqDeep'
    : 'flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-turq/10 hover:text-brand-turqDeep'
}

function AdminLayout({ user }: { user: AuthUser }) {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Panel administrativo | High Clean SAS'
  }, [])

  const handleLogout = async () => {
    if (pending) return

    setPending(true)

    try {
      await logout()
      navigate('/')
    } catch {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-100 via-white to-green-50">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-transparente.png"
              alt=""
              width={533}
              height={360}
              loading="lazy"
              className="h-10 w-auto"
            />
            <span className="hidden font-display text-lg font-bold tracking-tight text-brand-ink sm:block">
              Panel administrativo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 md:block">
              <span className="font-semibold text-slate-800">{user.email}</span>{' '}
              (rol: {user.role})
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-brand-turq px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav
          aria-label="Navegación del panel"
          className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout