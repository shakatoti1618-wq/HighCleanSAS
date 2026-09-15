import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Login from './Login.tsx'
import { getCurrentUser, login } from '../lib/auth.ts'

vi.mock('../lib/auth.ts', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

const adminUser = { id: 'user-1', email: 'admin@highclean.local', role: 'admin' }

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<p>panel-admin</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'admin@highclean.local' },
  })
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { value: 'supersegura-123' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

afterEach(() => {
  cleanup()
})

describe('Login', () => {
  it('redirige a /admin al iniciar sesión correctamente', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)
    vi.mocked(login).mockResolvedValueOnce(adminUser)

    renderLogin()
    fillAndSubmit()

    expect(login).toHaveBeenCalledWith('admin@highclean.local', 'supersegura-123')
    await waitFor(() => {
      expect(screen.getByText('panel-admin')).toBeDefined()
    })
  })

  it('muestra el error del servidor cuando falla el login', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null)
    vi.mocked(login).mockRejectedValueOnce(
      new Error('Correo o contraseña incorrectos'),
    )

    renderLogin()
    fillAndSubmit()

    const alert = await screen.findByRole('alert')

    expect(alert.textContent).toContain('Correo o contraseña incorrectos')
  })

  it('redirige a /admin si ya hay sesión activa', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(adminUser)

    renderLogin()

    await waitFor(() => {
      expect(screen.getByText('panel-admin')).toBeDefined()
    })
  })
})