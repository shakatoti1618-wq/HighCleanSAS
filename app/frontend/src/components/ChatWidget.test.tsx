import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChatWidget from './ChatWidget.tsx'
import { sendChatMessage } from '../lib/api.ts'

vi.mock('lucide-react', () => ({
  MessageCircle: () => <svg data-testid="icon-message" />,
  Send: () => <svg data-testid="icon-send" />,
  X: () => <svg data-testid="icon-x" />,
}))

vi.mock('../lib/api.ts', () => ({
  sendChatMessage: vi.fn(),
}))

afterEach(() => cleanup())

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.mocked(sendChatMessage).mockReset()
  })

  it('muestra el panel de chat al hacer clic en el toggle', () => {
    render(<ChatWidget />)

    const toggle = screen.getByRole('button', { name: 'Abrir chat' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)

    expect(
      screen.getByText('Hola, soy el asistente virtual de High Clean SAS', { exact: false }),
    ).toBeDefined()
    expect(screen.getByRole('dialog', { name: 'Asistente virtual' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cerrar chat' })).toBeDefined()
  })

  it('envía un mensaje y muestra la respuesta del asistente', async () => {
    const assistantResponse = 'Ofrecemos limpieza comercial y mantenimiento.'
    vi.mocked(sendChatMessage).mockResolvedValueOnce(assistantResponse)

    render(<ChatWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir chat' }))

    const input = screen.getByRole('textbox', { name: 'Escribe tu mensaje' })
    fireEvent.change(input, { target: { value: '¿Qué servicios ofrecen?' } })
    fireEvent.submit(input.closest('form')!)

    expect(sendChatMessage).toHaveBeenCalledWith('¿Qué servicios ofrecen?')
    await waitFor(() => {
      expect(screen.getByText(assistantResponse)).toBeDefined()
    })
  })

  it('muestra un error cuando falla la conexión', async () => {
    vi.mocked(sendChatMessage).mockRejectedValueOnce(
      new Error('No se pudo conectar con el asistente.'),
    )

    render(<ChatWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir chat' }))

    const input = screen.getByRole('textbox', { name: 'Escribe tu mensaje' })
    fireEvent.change(input, { target: { value: 'Hola' } })
    fireEvent.submit(input.closest('form')!)

    expect(
      await screen.findByRole('alert'),
    ).toBeDefined()
  })

  it('cierra el panel al presionar Escape', () => {
    render(<ChatWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir chat' }))
    expect(screen.getByRole('dialog', { name: 'Asistente virtual' })).toBeDefined()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Asistente virtual' })).toBeNull()
  })
})