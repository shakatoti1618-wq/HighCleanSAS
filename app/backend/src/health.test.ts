import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

const app = createApp()

describe('GET /api/v1/health', () => {
  it('responde ok con estado y timestamp', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ status: 'ok' })
    expect(response.body.timestamp).toBeTypeOf('string')
    expect(new Date(response.body.timestamp).getTime()).not.toBeNaN()
  })
})

describe('rutas inexistentes', () => {
  it('devuelve 404 con formato de error', async () => {
    const response = await request(app).get('/api/v1/no-existe')

    expect(response.status).toBe(404)
    expect(response.body.error).toBeDefined()
    expect(response.body.error.message).toContain('Ruta no encontrada')
  })
})