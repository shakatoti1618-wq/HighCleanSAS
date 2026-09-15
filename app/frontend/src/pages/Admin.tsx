import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LogOut } from 'lucide-react'
import type { AuthUser } from '../lib/auth.ts'
import { logout } from '../lib/auth.ts'
import { EASE } from '../lib/motion.ts'

function Admin({ user }: { user: AuthUser }) {
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
    <motion.section
      aria-labelledby="admin-title"
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <h1
            id="admin-title"
            className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold text-transparent"
          >
            Panel administrativo
          </h1>

          <p className="mt-3 text-slate-600">
            Has iniciado sesión como{' '}
            <span className="font-semibold text-slate-800">{user.email}</span>{' '}
            (rol: {user.role}).
          </p>

          <div className="mt-6 rounded-2xl bg-brand-turqSoft px-5 py-4 text-sm text-slate-700">
            TODO: el panel administrativo (gestión de servicios, reseñas,
            mensajes, galería e información empresarial) se implementa en el
            Módulo 13.
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-turq px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </motion.section>
  )
}

export default Admin