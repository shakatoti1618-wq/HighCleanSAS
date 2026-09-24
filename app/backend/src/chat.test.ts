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
      email: 'cotizaciones@highcleansas.com',
      schedules: REAL_SCHEDULES,
      serviceCities: ['Bogotá', 'Villavicencio', 'Medellín', 'Cartagena'],
      address: 'Calle 16 # 8A-53, Edificio Opolo, Bogotá',
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
    expect(response.body.response).toContain('cotizaciones@highcleansas.com')
    expect(response.body.response).not.toContain('no tengo los datos de contacto')
  })

  it('responde con precios publicados y redirige a cotización personalizada', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: '¿Cuánto cuesta la limpieza?' })

    expect(response.status).toBe(200)
    expect(response.body.response).toContain('página de Servicios')
    expect(response.body.response).toContain('cotización personalizada')
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

  it('responde con info de contacto y ciudades al preguntar dónde ubicarlos — ciudades primero', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: 'en donde los puedo ubicar' })

    expect(response.status).toBe(200)
    // Debe empezar con "Prestamos servicio en:" (ciudades primero)
    expect(response.body.response).toMatch(/^Prestamos servicio en:/)
    expect(response.body.response).toContain('Bogotá')
    expect(response.body.response).toContain('Villavicencio')
    expect(response.body.response).toContain('Medellín')
    expect(response.body.response).toContain('Cartagena')
    expect(response.body.response).toContain('Nuestra oficina está en:')
  })

  it('prioriza correo al preguntar a qué correo enviar cotización — email primero', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .send({ message: 'a que correo puedo enviar mi cotizacion' })

    expect(response.status).toBe(200)
    // Debe empezar con el correo
    expect(response.body.response).toMatch(/^Puedes enviar tu cotizaci[oó]n a /)
    expect(response.body.response).toContain('cotizaciones@highcleansas.com')
    expect(response.body.response).not.toContain('página de Servicios')
  })
})