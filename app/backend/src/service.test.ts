import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const TEST_COMPANY = 'Empresa de prueba módulo 6'

afterAll(async () => {
  await prisma.service.deleteMany({
    where: { company: { name: TEST_COMPANY } },
  })
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
  await prisma.$disconnect()
})

describe('GET /api/v1/services', () => {
  it('responde un arreglo ordenado por createdAt ASC, id ASC', async () => {
    const company = await prisma.company.create({
      data: { name: TEST_COMPANY },
    })

    const t1 = new Date('2026-01-01T10:00:00.000Z')
    const t2 = new Date('2026-01-01T11:00:00.000Z')
    const t3 = new Date('2026-01-01T12:00:00.000Z')

    await prisma.service.create({
      data: { name: 'Servicio T3', companyId: company.id, createdAt: t3 },
    })
    await prisma.service.create({
      data: { name: 'Servicio T1', companyId: company.id, createdAt: t1 },
    })
    await prisma.service.create({
      data: { name: 'Servicio T2', companyId: company.id, createdAt: t2 },
    })

    const response = await request(app).get('/api/v1/services')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(
      response.body.map((service: { name: string }) => service.name),
    ).toEqual(['Servicio T1', 'Servicio T2', 'Servicio T3'])
    expect(response.body[0].createdAt).toBe(t1.toISOString())
  })

  it('responde con lista vacía cuando no hay servicios', async () => {
    await prisma.service.deleteMany({
      where: { company: { name: TEST_COMPANY } },
    })

    const response = await request(app).get('/api/v1/services')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})