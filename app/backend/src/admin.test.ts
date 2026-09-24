import { hashSync } from 'bcryptjs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import type { Prisma } from './generated/prisma/client.js'
import { BCRYPT_ROUNDS } from './services/auth.service.js'

const app = createApp()

const TEST_PASSWORD = 'test-admin-password-123'
const TEST_ADMIN_EMAIL = 'admin.test@highclean.local'
const TEST_AGENT_EMAIL = 'other.test@highclean.local'
const ROLE_NAME = 'admin'
const TEST_COMPANY_ID = 'a6000000-0000-4000-8000-000000000001'
const TEST_COMPANY_NAME = 'High Clean SAS Test Admin'

let companyId: string

beforeEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_AGENT_EMAIL] } },
  })
  await prisma.session.deleteMany()
  await prisma.review.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.service.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.contactMessage.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.galleryImage.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.company.deleteMany({ where: { id: TEST_COMPANY_ID } })

  const company = await prisma.company.create({
    data: {
      id: TEST_COMPANY_ID,
      name: TEST_COMPANY_NAME,
      serviceCities: [],
    },
  })
  companyId = company.id

  const role = await prisma.role.upsert({
    where: { name: ROLE_NAME },
    create: { name: ROLE_NAME },
    update: {},
  })

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    create: { name: 'staff' },
    update: {},
  })

  await prisma.user.createMany({
    data: [
      {
        id: 'a1000000-0000-4000-8000-000000000001',
        email: TEST_ADMIN_EMAIL,
        passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
        roleId: role.id,
      },
      {
        id: 'a1000000-0000-4000-8000-000000000002',
        email: TEST_AGENT_EMAIL,
        passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
        roleId: staffRole.id,
      },
    ],
  })
})

describe('Panel administrador', () => {
  it('devuelve 401 sin sesión', async () => {
    const response = await request(app).get('/api/v1/admin/dashboard')
    expect(response.status).toBe(401)
    expect(response.body.error).toMatchObject({ code: 'AuthenticationError' })
  })

  it('devuelve 403 para un usuario autenticado que no es admin', async () => {
    const agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_AGENT_EMAIL, password: TEST_PASSWORD })

    const response = await agent.get('/api/v1/admin/dashboard')
    expect(response.status).toBe(403)
    expect(response.body.error).toMatchObject({ code: 'AuthorizationError' })
  })
})

describe('GET /api/v1/admin/dashboard', () => {
  let agent: ReturnType<typeof request.agent>

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })
  })

  it('devuelve los conteos del panel', async () => {
    await prisma.review.create({
      data: { author: 'Pepe', content: 'Muy buen servicio', rating: 5, companyId },
    })

    const response = await agent.get('/api/v1/admin/dashboard')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      services: expect.any(Number),
      gallery: expect.any(Number),
      reviews: {
        total: expect.any(Number),
        pending: expect.any(Number),
      },
      messages: {
        total: expect.any(Number),
        unread: expect.any(Number),
      },
      jobs: {
        total: expect.any(Number),
        new: expect.any(Number),
      },
    })
  })
})

describe('CRUD administrativo de servicios', () => {
  let agent: ReturnType<typeof request.agent>

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })
  })

  afterEach(async () => {
    await prisma.service.deleteMany({ where: { name: 'Aseo general' } })
  })

  it('crea, lista, actualiza y elimina un servicio', async () => {
    const createRes = await agent
      .post('/api/v1/admin/services')
      .send({ name: 'Aseo general', description: 'Para hogares' })

    expect(createRes.status).toBe(201)
    expect(createRes.body.name).toBe('Aseo general')
    const serviceId: string = createRes.body.id

    const listRes = await agent.get('/api/v1/admin/services')
    expect(listRes.status).toBe(200)
    const created = listRes.body.find(
      (service: { name: string }) => service.name === 'Aseo general',
    )
    expect(created).toBeDefined()

    const updateRes = await agent
      .patch(`/api/v1/admin/services/${serviceId}`)
      .send({ description: 'Para hogares y oficinas' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.description).toBe('Para hogares y oficinas')

    const delRes = await agent.delete(`/api/v1/admin/services/${serviceId}`)
    expect(delRes.status).toBe(204)

    const afterDelete = await prisma.service.findUnique({ where: { id: serviceId } })
    expect(afterDelete).toBeNull()
  })

  it('rechaza crear un servicio sin nombre con 400', async () => {
    const response = await agent.post('/api/v1/admin/services').send({})
    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })

  it('devuelve 404 al actualizar un servicio inexistente', async () => {
    const response = await agent
      .patch('/api/v1/admin/services/a9999999-9999-4999-8999-999999999999')
      .send({ name: 'Nuevo nombre' })

    expect(response.status).toBe(404)
    expect(response.body.error).toMatchObject({ code: 'NotFoundError' })
  })

  it('reemplaza las modalidades de un servicio', async () => {
    const createRes = await agent
      .post('/api/v1/admin/services')
      .send({ name: 'Aseo general' })
    const serviceId: string = createRes.body.id

    const putRes = await agent
      .put(`/api/v1/admin/services/${serviceId}/options`)
      .send({
        options: [
          { label: 'Tiempo Completo', price: 3350000, sortOrder: 1 },
          { label: 'Medio Tiempo', price: 2200000, note: 'Incluye planchado', sortOrder: 2 },
        ],
      })

    expect(putRes.status).toBe(200)
    expect(putRes.body.options).toHaveLength(2)
    expect(putRes.body.options[0]).toMatchObject({
      label: 'Tiempo Completo',
      price: 3350000,
      sortOrder: 1,
    })
    expect(putRes.body.options[1]).toMatchObject({
      label: 'Medio Tiempo',
      price: 2200000,
      note: 'Incluye planchado',
    })

    const replaceRes = await agent
      .put(`/api/v1/admin/services/${serviceId}/options`)
      .send({ options: [{ label: 'Solo Días', price: 135000, note: null, group: null, sortOrder: 1 }] })

    expect(replaceRes.status).toBe(200)
    expect(replaceRes.body.options).toHaveLength(1)
    expect(replaceRes.body.options[0].note).toBeNull()
  })

  it('rechaza un reemplazo de modalidades vacío con 400', async () => {
    const createRes = await agent
      .post('/api/v1/admin/services')
      .send({ name: 'Aseo general' })

    const response = await agent
      .put(`/api/v1/admin/services/${createRes.body.id}/options`)
      .send({ options: [] })

    expect(response.status).toBe(400)
  })
})

describe('Reseñas administrativas', () => {
  let agent: ReturnType<typeof request.agent>
  let reviewId: string

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })

    const review = await prisma.review.create({
      data: {
        id: 'a3000000-0000-4000-8000-000000000001',
        author: 'Cliente prueba',
        content: 'Buena atención',
        rating: 5,
        status: 'PENDING',
        companyId,
      },
    })
    reviewId = review.id
  })

  afterEach(async () => {
    await prisma.review.deleteMany({ where: { id: { startsWith: 'a3000000' } } })
  })

  it('lista todas las reseñas y permite aprobarlas', async () => {
    const list = await agent.get('/api/v1/admin/reviews')
    expect(list.status).toBe(200)
    expect(list.body.some((item: { id: string }) => item.id === reviewId)).toBe(true)

    const approve = await agent
      .patch(`/api/v1/admin/reviews/${reviewId}`)
      .send({ status: 'APPROVED' })

    expect(approve.status).toBe(200)
    expect(approve.body.status).toBe('APPROVED')

    const deleted = await agent.delete(`/api/v1/admin/reviews/${reviewId}`)
    expect(deleted.status).toBe(204)
    expect(await prisma.review.findUnique({ where: { id: reviewId } })).toBeNull()
  })

  it('rechaza un estado inválido con 400', async () => {
    const response = await agent
      .patch(`/api/v1/admin/reviews/${reviewId}`)
      .send({ status: 'PUBLICADO' })

    expect(response.status).toBe(400)
  })
})

describe('Mensajes administrativos', () => {
  let agent: ReturnType<typeof request.agent>
  let messageId: string

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })

    const message = await prisma.contactMessage.create({
      data: {
        id: 'a4000000-0000-4000-8000-000000000001',
        name: 'Test',
        email: 'test@example.com',
        message: 'Cotización',
        companyId,
      },
    })
    messageId = message.id
  })

  afterEach(async () => {
    await prisma.contactMessage.deleteMany({ where: { id: { startsWith: 'a4000000' } } })
  })

  it('lista mensajes, los marca como leídos y los elimina', async () => {
    const list = await agent.get('/api/v1/admin/messages')
    expect(list.status).toBe(200)
    expect(list.body.some((item: { id: string }) => item.id === messageId)).toBe(true)

    const read = await agent.patch(`/api/v1/admin/messages/${messageId}`)
    expect(read.status).toBe(200)
    expect(read.body.read).toBe(true)

    const deleted = await agent.delete(`/api/v1/admin/messages/${messageId}`)
    expect(deleted.status).toBe(204)
  })
})

describe('Galería administrativa', () => {
  let agent: ReturnType<typeof request.agent>

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })
  })

  afterEach(async () => {
    await prisma.galleryImage.deleteMany({ where: { alt: 'Oficina limpia' } })
  })

  it('agrega, lista y elimina una imagen por URL', async () => {
    const create = await agent
      .post('/api/v1/admin/gallery')
      .send({ url: 'https://example.com/img-1.jpg', alt: 'Oficina limpia' })

    expect(create.status).toBe(201)
    const imageId: string = create.body.id

    const list = await agent.get('/api/v1/admin/gallery')
    expect(list.body.some((item: { alt: string }) => item.alt === 'Oficina limpia')).toBe(true)

    const del = await agent.delete(`/api/v1/admin/gallery/${imageId}`)
    expect(del.status).toBe(204)
  })
})

describe('Empresa administrativa', () => {
  let agent: ReturnType<typeof request.agent>
  const saved = new Map<string, unknown>()

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })

    const company = await prisma.company.findUnique({
      where: { id: TEST_COMPANY_ID },
    })
    if (company) {
      saved.set('description', company.description)
      saved.set('nit', company.nit)
      saved.set('mission', company.mission)
      saved.set('vision', company.vision)
      saved.set('qualityPolicy', company.qualityPolicy)
      saved.set('values', company.values)
      saved.set('phone', company.phone)
      saved.set('whatsappNumber', company.whatsappNumber)
      saved.set('email', company.email)
      saved.set('address', company.address)
      saved.set('schedules', company.schedules)
      saved.set('serviceCities', company.serviceCities)
      saved.set('activeClients', company.activeClients)
      saved.set('yearsOperating', company.yearsOperating)
      saved.set('monthlyServices', company.monthlyServices)
    }
  })

  afterEach(async () => {
    const company = await prisma.company.findUnique({
      where: { id: TEST_COMPANY_ID },
    })
    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          description: saved.get('description') as string | null,
          nit: saved.get('nit') as string | null,
          mission: saved.get('mission') as string | null,
          vision: saved.get('vision') as string | null,
          qualityPolicy: saved.get('qualityPolicy') as string | null,
          values: saved.get('values') as Prisma.InputJsonValue | undefined,
          phone: saved.get('phone') as string | null,
          whatsappNumber: saved.get('whatsappNumber') as string | null,
          email: saved.get('email') as string | null,
          address: saved.get('address') as string | null,
          schedules: saved.get('schedules') as string | null,
          serviceCities: saved.get('serviceCities') as string[],
          activeClients: saved.get('activeClients') as number | null,
          yearsOperating: saved.get('yearsOperating') as number | null,
          monthlyServices: saved.get('monthlyServices') as number | null,
        },
      })
    }
  })

  it('actualiza los datos de la empresa', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ description: 'Nueva descripción de prueba' })

    expect(response.status).toBe(200)
    expect(response.body.description).toBe('Nueva descripción de prueba')
  })

  it('actualiza las ciudades de cobertura', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ serviceCities: ['Bogotá', 'Villavicencio'] })

    expect(response.status).toBe(200)
    expect(response.body.serviceCities).toEqual(['Bogotá', 'Villavicencio'])
  })

  it('actualiza el NIT', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ nit: '901330960-1' })

    expect(response.status).toBe(200)
    expect(response.body.nit).toBe('901330960-1')
  })

  it('actualiza las estadísticas de la empresa', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ activeClients: 500, yearsOperating: 8, monthlyServices: 700 })

    expect(response.status).toBe(200)
    expect(response.body.activeClients).toBe(500)
    expect(response.body.yearsOperating).toBe(8)
    expect(response.body.monthlyServices).toBe(700)
  })

  it('rechaza estadísticas no enteras con 400', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ activeClients: 500.5 })

    expect(response.status).toBe(400)
  })

  it('rechaza un NIT con formato inválido', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ nit: '901330960' })

    expect(response.status).toBe(400)
  })

  it('rechaza una lista de ciudades vacía con 400', async () => {
    const response = await agent
      .patch('/api/v1/admin/company')
      .send({ serviceCities: [] })

    expect(response.status).toBe(400)
  })

  it('rechaza un cuerpo vacío con 400', async () => {
    const response = await agent.patch('/api/v1/admin/company').send({})
    expect(response.status).toBe(400)
  })
})

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_AGENT_EMAIL] } },
  })
  await prisma.review.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.service.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.contactMessage.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.galleryImage.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.company.deleteMany({ where: { id: TEST_COMPANY_ID } })
  await prisma.$disconnect()
})