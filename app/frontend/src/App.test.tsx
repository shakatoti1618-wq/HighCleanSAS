import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

const renderApp = () =>
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )

describe('App', () => {
  it('muestra el nombre de la empresa en la página principal', () => {
    renderApp()
    expect(
      screen.getByRole('heading', { name: /high clean sas/i }),
    ).toBeInTheDocument()
  })

  it('navega a la página de servicios', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: /^servicios$/i }))
    expect(
      screen.getByRole('heading', { name: /^servicios$/i }),
    ).toBeInTheDocument()
  })

  it('navega a la página de contacto', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: /contacto/i }))
    expect(
      screen.getByRole('heading', { name: /^contacto$/i }),
    ).toBeInTheDocument()
  })
})