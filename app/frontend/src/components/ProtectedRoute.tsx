import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser, type AuthUser } from '../lib/auth.ts'

function ProtectedRoute({
  children,
}: {
  children: (user: AuthUser) => ReactNode
}) {
  const [state, setState] = useState<'loading' | 'authed' | 'guest'>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let active = true

    void getCurrentUser()
      .then((current) => {
        if (!active) return
        setUser(current)
        setState(current ? 'authed' : 'guest')
      })
      .catch(() => {
        if (!active) return
        setState('guest')
      })

    return () => {
      active = false
    }
  }, [])

  if (state === 'loading') return null
  if (state === 'guest') return <Navigate to="/login" replace />

  return children(user as AuthUser)
}

export default ProtectedRoute