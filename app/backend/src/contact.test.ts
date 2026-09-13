import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const TEST_COMPANY = 'Empresa de prueba módulo 9'

beforeEach(async () => {
  await prisma.contactMessage.deleteMany()
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
  await prisma.company.create({ data: { name: TEST_COMPANY } })
})

afterEach(async () => {
  await prisma.contactMessage.deleteMany({
    where: { company: { name: TEST_COMPANY } },
  })
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/v1/contact', () => {
  it('responde 201 y guarda un mensaje válido', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: '  Ana García  ',
      email: 'ana@example.com',
      message: 'Quiero una cotización para oficinas.',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Ana García',
      email: 'ana@example.com',
      message: 'Quiero una cotización para oficinas.',
    })
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('createdAt')

    const stored = await prisma.contactMessage.findFirst({
      where: { email: 'ana@example.com' },
    })
    expect(stored).not.toBeNull()
    expect(stored?.name).toBe('Ana García')
  })

  it('responde 400 con email inválido', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: 'Ana García',
      email: 'correo-invalido',
      message: 'Quiero una cotización.',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })

  it('responde 400 cuando falta el mensaje', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: 'Ana García',
      email: 'ana@example.com',
      message: '   ',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })

  it('responde 201 sin guardar nada cuando el honeypot está rellenado', async () => {
    const response = await request(app).post('/api/v1/contact').send({
      name: 'Bot',
      email: 'bot@spam.com',
      message: 'Oferta increíble',
      website: 'http://spam.example.com',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ id: null })

    const count = await prisma.contactMessage.count()
    expect(count).toBe(0)
  })
})