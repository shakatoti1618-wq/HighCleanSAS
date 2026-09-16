import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

const app = createApp()

describe('Manejo de errores', () => {
  it('devuelve 400 con error de validación si el JSON es inválido', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{json roto')

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(response.body.error.message).toContain('JSON válido')
  })
})