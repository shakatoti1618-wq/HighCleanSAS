import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TrabajaConNosotros from './TrabajaConNosotros.tsx'
import { applyJob } from '../lib/jobs.ts'

vi.mock('../lib/jobs.ts', () => ({
  applyJob: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/trabaja-con-nosotros']}>
      <TrabajaConNosotros />
    </MemoryRouter>,
  )
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('Nombre completo'), {
    target: { value: 'Ana García' },
  })
  fireEvent.change(screen.getByLabelText('Cargo al que aplica'), {
    target: { value: 'Aseadora' },
  })
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'ana.garcia@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Teléfono'), {
    target: { value: '3007654321' },
  })
  fireEvent.change(screen.getByLabelText(/Hoja de vida/), {
    target: {
      files: [new File(['pdf'], 'cv.pdf', { type: 'application/pdf' })],
    },
  })
}

afterEach(() => {
  cleanup()
})

describe('TrabajaConNosotros', () => {
  beforeEach(() => {
    vi.mocked(applyJob).mockReset()
  })

  it('bloquea el envío sin autorización de datos personales', () => {
    vi.mocked(applyJob).mockResolvedValueOnce({
      id: 'job-1',
      createdAt: '2026-09-16T00:00:00.000Z',
    })

    renderPage()
    fillForm()
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar postulación' }).closest('form')!)

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('Debes autorizar el tratamiento de tus datos personales')
    expect(applyJob).not.toHaveBeenCalled()
  })

  it('envía la postulación cuando se autoriza el tratamiento de datos', async () => {
    vi.mocked(applyJob).mockResolvedValueOnce({
      id: 'job-1',
      createdAt: '2026-09-16T00:00:00.000Z',
    })

    renderPage()
    fillForm()
    fireEvent.click(screen.getByLabelText(/He leído y autorizo el tratamiento/))

    fireEvent.submit(screen.getByRole('button', { name: 'Enviar postulación' }).closest('form')!)

    await waitFor(() => {
      expect(applyJob).toHaveBeenCalledTimes(1)
    })

    const input = vi.mocked(applyJob).mock.calls[0]?.[0]
    expect(input).toMatchObject({
      name: 'Ana García',
      position: 'Aseadora',
      email: 'ana.garcia@example.com',
      phone: '3007654321',
      consent: true,
    })
    expect(input?.file.name).toBe('cv.pdf')

    expect(
      await screen.findByText(/Postulación enviada/i),
    ).toBeInTheDocument()
  })

  it('muestra un error del servidor si falla el envío', async () => {
    vi.mocked(applyJob).mockRejectedValueOnce(
      new Error('La hoja de vida excede el tamaño máximo'),
    )

    renderPage()
    fillForm()
    fireEvent.click(screen.getByLabelText(/He leído y autorizo el tratamiento/))

    fireEvent.submit(screen.getByRole('button', { name: 'Enviar postulación' }).closest('form')!)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('La hoja de vida excede el tamaño máximo')
  })

  it('enlaza a la política de tratamiento de datos', () => {
    renderPage()
    const links = screen.getAllByRole('link', {
      name: 'Política de Tratamiento de Datos Personales',
    })
    expect(links.length).toBeGreaterThanOrEqual(1)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/politica-de-datos')
    }
  })
})