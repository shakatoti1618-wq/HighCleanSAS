import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

const COMPANY_ID = '13d5c1ef-3b57-4c18-9f0a-93d7b3e5c001'

beforeEach(async () => {
  await prisma.company.deleteMany()
  await prisma.company.create({
    data: {
      id: COMPANY_ID,
      name: 'High Clean SAS',
      nit: '901330960-1',
      serviceCities: ['Bogotá', 'Medellín'],
    },
  })
})

afterEach(async () => {
  await prisma.company.deleteMany({ where: { id: COMPANY_ID } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /api/v1/company', () => {
  it('responde con la información de la empresa', async () => {
    const response = await request(app).get('/api/v1/company')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'High Clean SAS' })
    expect(response.body).toHaveProperty('mission')
    expect(response.body).toHaveProperty('vision')
    expect(response.body).toHaveProperty('values')
    expect(response.body).toHaveProperty('whatsappNumber')
    expect(response.body.whatsappNumber).toBeNull()
    expect(response.body).toHaveProperty('serviceCities')
    expect(response.body.serviceCities).toEqual(['Bogotá', 'Medellín'])
    expect(response.body.nit).toBe('901330960-1')
  })
})