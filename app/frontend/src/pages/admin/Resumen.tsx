import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  Star,
} from 'lucide-react'
import { fetchAdminDashboard, type AdminDashboard } from '../../lib/admin.ts'

interface StatCard {
  label: string
  value: number
  hint: string
  href: string
  icon: typeof LayoutDashboard
}

function emptyDashboard(): AdminDashboard {
  return {
    services: 0,
    reviews: { total: 0, pending: 0, approved: 0, rejected: 0 },
    messages: { total: 0, unread: 0 },
    gallery: 0,
    jobs: { total: 0, new: 0 },
  }
}

function Resumen() {
  const [stats, setStats] = useState<AdminDashboard>(emptyDashboard)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void fetchAdminDashboard()
      .then((data) => {
        if (active) setStats(data)
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar las estadísticas',
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  const cards: StatCard[] = [
    {
      label: 'Servicios',
      value: stats.services,
      href: '/admin/servicios',
      hint: 'activos',
      icon: MessageSquareText,
    },
    {
      label: 'Reseñas por aprobar',
      value: stats.reviews.pending,
      href: '/admin/resenas',
      hint: `${stats.reviews.total} en total`,
      icon: Star,
    },
    {
      label: 'Mensajes sin leer',
      value: stats.messages.unread,
      href: '/admin/mensajes',
      hint: `${stats.messages.total} en total`,
      icon: Inbox,
    },
    {
      label: 'Imágenes de galería',
      value: stats.gallery,
      href: '/admin/galeria',
      hint: 'publicadas',
      icon: Images,
    },
    {
      label: 'Postulaciones nuevas',
      value: stats.jobs.new,
      href: '/admin/postulaciones',
      hint: `${stats.jobs.total} en total`,
      icon: FileText,
    },
  ]

  return (
    <section aria-labelledby="resumen-title">
      <h1
        id="resumen-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Resumen
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Un vistazo rápido al contenido de tu sitio.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, href, hint, icon: Icon }) => (
          <Link
            key={label}
            to={href}
            className="group rounded-sm border border-brand-turqSoft bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-sm bg-brand-turq/10 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5 text-brand-turqDeep" />
              </span>
              <span className="stat-num font-display text-3xl font-bold text-brand-ink">
                {value}
              </span>
            </div>
            <p className="mt-4 font-display text-sm font-semibold text-slate-800">
              {label}
            </p>
            <p className="text-xs text-slate-500">{hint}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Resumen