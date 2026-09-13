import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const TEST_COMPANY = 'Empresa de prueba módulo 8'

beforeEach(async () => {
  await prisma.review.deleteMany()
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
})

afterEach(async () => {
  await prisma.review.deleteMany({
    where: { company: { name: TEST_COMPANY } },
  })
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /api/v1/reviews', () => {
  it('responde únicamente reseñas aprobadas', async () => {
    const company = await prisma.company.create({
      data: { name: TEST_COMPANY },
    })

    await prisma.review.create({
      data: {
        author: 'Cliente aprobado',
        content: 'Reseña aprobada',
        rating: 5,
        status: 'APPROVED',
        companyId: company.id,
      },
    })
    await prisma.review.create({
      data: {
        author: 'Cliente pendiente',
        content: 'Reseña pendiente',
        rating: 3,
        status: 'PENDING',
        companyId: company.id,
      },
    })
    await prisma.review.create({
      data: {
        author: 'Cliente rechazado',
        content: 'Reseña rechazada',
        rating: 1,
        status: 'REJECTED',
        companyId: company.id,
      },
    })

    const response = await request(app).get('/api/v1/reviews')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      author: 'Cliente aprobado',
      status: 'APPROVED',
      rating: 5,
    })
  })

  it('responde un arreglo ordenado por createdAt DESC, id DESC', async () => {
    const company = await prisma.company.create({
      data: { name: TEST_COMPANY },
    })

    const t1 = new Date('2026-01-01T10:00:00.000Z')
    const t2 = new Date('2026-01-01T11:00:00.000Z')
    const t3 = new Date('2026-01-01T12:00:00.000Z')

    await prisma.review.create({
      data: {
        author: 'Autor T3',
        content: 'Contenido T3',
        rating: 5,
        status: 'APPROVED',
        companyId: company.id,
        createdAt: t3,
      },
    })
    await prisma.review.create({
      data: {
        author: 'Autor T1',
        content: 'Contenido T1',
        rating: 5,
        status: 'APPROVED',
        companyId: company.id,
        createdAt: t1,
      },
    })
    await prisma.review.create({
      data: {
        author: 'Autor T2',
        content: 'Contenido T2',
        rating: 5,
        status: 'APPROVED',
        companyId: company.id,
        createdAt: t2,
      },
    })

    const response = await request(app).get('/api/v1/reviews')

    expect(response.status).toBe(200)
    expect(
      response.body.map((review: { author: string }) => review.author),
    ).toEqual(['Autor T3', 'Autor T2', 'Autor T1'])
  })

  it('responde con lista vacía cuando no hay reseñas aprobadas', async () => {
    const company = await prisma.company.create({
      data: { name: TEST_COMPANY },
    })

    await prisma.review.create({
      data: {
        author: 'Cliente pendiente',
        content: 'Solo existe una reseña pendiente',
        rating: 4,
        status: 'PENDING',
        companyId: company.id,
      },
    })

    const response = await request(app).get('/api/v1/reviews')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})