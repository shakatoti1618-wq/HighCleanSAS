import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const COMPANY_ID = '13d5c1ef-3b57-4c18-9f0a-93d7b3e5c001'

const REAL_SCHEDULES =
  'Lunes a viernes: 8:00 am a 5:00 pm\nSábado y domingo: 8:00 am a 12:00 pm'

beforeEach(async () => {
  await prisma.contactMessage.deleteMany()
  await prisma.review.deleteMany()
  await prisma.service.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.company.deleteMany()
  await prisma.company.create({
    data: {
      id: COMPANY_ID,
      name: 'High Clean SAS',
      phone: '+573209498347',
      whatsappNumber: '+573209498347',
      email: 'highcleanclaient@gmail.com',
      schedules: REAL_SCHEDULES,
    },
  })
  await prisma.service.createMany({
    data: [
      { name: 'Limpieza comercial', companyId: COMPANY_ID },
      { name: 'Mantenimiento general', companyId: COMPANY_ID },
    ],
  })
})

afterEach(async () => {
  await prisma.service.deleteMany({ where: { companyId: COMPANY_ID } })
  await prisma.company.deleteMany({ where: { id: COMPANY_ID } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/v1/chat', () => {
  it('responde con los servicios registrados', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Qué servicios ofrecen?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain('Limpieza comercial')
    expect(response.body.response).toContain('Mantenimiento general')
  })

  it('responde con el horario registrado', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Cuál es su horario de atención?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain(REAL_SCHEDULES)
  })

  it('responde contactos reales sin caer en el fallback', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Cómo los contacto?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain('+573209498347')
    expect(response.body.response).toContain('highcleanclaient@gmail.com')
    expect(response.body.response).not.toContain('no tengo los datos de contacto')
  })

  it('no inventa precios y recomienda cotización directa', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Cuánto cuesta la limpieza?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain('aún no están publicados')
  })

  it('dice que no sabe cuando desconoce el tema', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Cuál es tu color favorito?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain('no tengo información')
  })

  it('responde 400 cuando el mensaje está vacío', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '   ' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })
})