import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Servicios from './Servicios.tsx'
import { fetchServices, type Service } from '../lib/api.ts'

vi.mock('../lib/api.ts', () => ({
  fetchServices: vi.fn(),
}))

const services: Service[] = [
  {
    id: 's-aseo',
    name: 'Aseo del Hogar',
    description: 'Limpieza integral del hogar.',
    imageUrl: 'https://media.highcleansas.com/services/aseo-del-hogar.jpeg',
    companyId: 'cmp',
    options: [
      {
        id: 'o1',
        label: 'Tiempo Completo Externa (7h)',
        price: 3350000,
        note: null,
        group: null,
        sortOrder: 1,
      },
      {
        id: 'o2',
        label: 'Medio Tiempo (3.5h)',
        price: 2200000,
        note: 'Incluye planchado',
        group: null,
        sortOrder: 2,
      },
    ],
  },
  {
    id: 's-conjunto',
    name: 'Aseo Conjuntos Residenciales',
    description: 'Áreas comunes.',
    imageUrl: null,
    companyId: 'cmp',
    options: [
      {
        id: 'o3',
        label: 'Tiempo Completo',
        price: 3450000,
        note: null,
        group: 'Generales',
        sortOrder: 1,
      },
      {
        id: 'o4',
        label: 'Por Días',
        price: 180000,
        note: 'Exclusivamente para apoyo puntual',
        group: 'Todero',
        sortOrder: 2,
      },
    ],
  },
]

function renderServicios() {
  return render(
    <MemoryRouter>
      <Servicios />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Servicios', () => {
  it('muestra foto, descripción y modalidades clickeables', async () => {
    vi.mocked(fetchServices).mockResolvedValueOnce(services)
    renderServicios()

    expect(await screen.findByText('Aseo del Hogar')).toBeDefined()
    expect(
      screen.getByAltText(/servicio de aseo del hogar.*high clean sas/i),
    ).toBeDefined()
    expect(screen.getByText('Limpieza integral del hogar.')).toBeDefined()

    const toggles = screen.getAllByRole('button', {
      name: 'Ver modalidades y precios',
    })
    expect(toggles).toHaveLength(2)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggles[0]!)

    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('$ 3.350.000')).toBeDefined()
    expect(screen.getByText('$ 2.200.000')).toBeDefined()
    expect(screen.getByText('Incluye planchado')).toBeDefined()
  })

  it('agrupa las modalidades de conjuntos por Generales y Todero', async () => {
    vi.mocked(fetchServices).mockResolvedValueOnce(services)
    renderServicios()

    await screen.findByText('Aseo Conjuntos Residenciales')

    const toggles = screen.getAllByRole('button', {
      name: 'Ver modalidades y precios',
    })
    fireEvent.click(toggles[1]!)

    expect(screen.getByText('Generales')).toBeDefined()
    expect(screen.getByText('Todero')).toBeDefined()
    expect(screen.getByText('$ 3.450.000')).toBeDefined()
    expect(screen.getByText('Exclusivamente para apoyo puntual')).toBeDefined()
  })

  it('muestra un mensaje de error cuando la carga falla', async () => {
    vi.mocked(fetchServices).mockRejectedValueOnce(new Error('red'))
    renderServicios()

    expect(
      await screen.findByText(
        'No se pudieron cargar los servicios. Intenta de nuevo más tarde.',
      ),
    ).toBeDefined()
  })
})