import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const TEST_COMPANY = 'Empresa de prueba módulo 7'

afterAll(async () => {
  await prisma.galleryImage.deleteMany({
    where: { company: { name: TEST_COMPANY } },
  })
  await prisma.company.deleteMany({ where: { name: TEST_COMPANY } })
  await prisma.$disconnect()
})

describe('GET /api/v1/gallery', () => {
  it('responde un arreglo de imágenes ordenado por createdAt ASC, id ASC', async () => {
    const company = await prisma.company.create({
      data: { name: TEST_COMPANY },
    })

    const t1 = new Date('2026-02-01T10:00:00.000Z')
    const t2 = new Date('2026-02-01T11:00:00.000Z')
    const t3 = new Date('2026-02-01T12:00:00.000Z')

    await prisma.galleryImage.create({
      data: { url: 'https://example.com/img-3.jpg', companyId: company.id, createdAt: t3 },
    })
    await prisma.galleryImage.create({
      data: { url: 'https://example.com/img-1.jpg', companyId: company.id, createdAt: t1 },
    })
    await prisma.galleryImage.create({
      data: { url: 'https://example.com/img-2.jpg', companyId: company.id, createdAt: t2 },
    })

    const response = await request(app).get('/api/v1/gallery')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(
      response.body.map((image: { url: string }) => image.url),
    ).toEqual([
      'https://example.com/img-1.jpg',
      'https://example.com/img-2.jpg',
      'https://example.com/img-3.jpg',
    ])
    expect(response.body[0].createdAt).toBe(t1.toISOString())
  })

  it('responde con lista vacía cuando no hay imágenes', async () => {
    await prisma.galleryImage.deleteMany({
      where: { company: { name: TEST_COMPANY } },
    })

    const response = await request(app).get('/api/v1/gallery')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})