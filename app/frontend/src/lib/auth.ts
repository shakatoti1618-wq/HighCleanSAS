export interface AuthUser {
  id: string
  email: string
  role: string
}

async function readError(response: Response, fallback: string): Promise<Error> {
  const detail = (await response.json().catch(() => null)) as {
    error?: { message?: string }
  } | null
  return new Error(detail?.error?.message ?? fallback)
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw await readError(response, 'No se pudo iniciar sesión')
  }

  const data = (await response.json()) as { user: AuthUser }
  return data.user
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/api/v1/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) return null
  if (!response.ok) {
    throw await readError(response, 'No se pudo verificar la sesión')
  }

  const data = (await response.json()) as { user: AuthUser | null }
  return data.user
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw await readError(response, 'No se pudo cerrar la sesión')
  }
}