import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const app = createApp()

describe('GET /api/v1/company', () => {
  it('responde con la información de la empresa', async () => {
    await prisma.company.upsert({
      where: { id: '13d5c1ef-3b57-4c18-9f0a-93d7b3e5c001' },
      create: { id: '13d5c1ef-3b57-4c18-9f0a-93d7b3e5c001', name: 'High Clean SAS' },
      update: {},
    })

    const response = await request(app).get('/api/v1/company')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'High Clean SAS' })
    expect(response.body).toHaveProperty('mission')
    expect(response.body).toHaveProperty('vision')
    expect(response.body).toHaveProperty('values')
  })
})