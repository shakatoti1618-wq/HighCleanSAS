import { hashSync } from 'bcryptjs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { BCRYPT_ROUNDS } from './services/auth.service.js'

const app = createApp()

const TEST_PASSWORD = 'test-admin-password-123'
const TEST_ADMIN_EMAIL = 'admin.jobs.test@highclean.local'
const TEST_AGENT_EMAIL = 'staff.jobs.test@highclean.local'
const ROLE_NAME = 'admin'
const TEST_COMPANY_ID = 'b3000000-0000-4000-8000-000000000001'
const TEST_COMPANY_NAME = 'High Clean SAS Test Jobs'

function fakePdf(content: string = 'MY_RESUME', size = 1024): Buffer {
  const buffer = Buffer.alloc(size, 'x')
  buffer.write(content, 0, content.length)
  return buffer
}

function sendFields(
  extra: Record<string, string> = {},
  fileBuffer: Buffer = fakePdf(),
) {
  let body = request(app)
    .post('/api/v1/jobs/apply')
    .field('name', 'Juan Pérez')
    .field('position', 'Aseador')
    .field('email', 'juan@example.com')
    .field('phone', '3001234567')
    .field('consent', 'on')

  for (const [key, value] of Object.entries(extra)) {
    body = body.field(key, value)
  }

  return body.attach('cv', fileBuffer, {
    filename: 'cv.pdf',
    contentType: 'application/pdf',
  })
}

beforeEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_AGENT_EMAIL] } },
  })
  await prisma.session.deleteMany()
  await prisma.jobApplication.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.company.deleteMany({ where: { id: TEST_COMPANY_ID } })
  await prisma.company.create({
    data: { id: TEST_COMPANY_ID, name: TEST_COMPANY_NAME },
  })

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
        id: 'b1000000-0000-4000-8000-000000000001',
        email: TEST_ADMIN_EMAIL,
        passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
        roleId: role.id,
      },
      {
        id: 'b1000000-0000-4000-8000-000000000002',
        email: TEST_AGENT_EMAIL,
        passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
        roleId: staffRole.id,
      },
    ],
  })
})

describe('POST /api/v1/jobs/apply', () => {
  afterEach(async () => {
    await prisma.jobApplication.deleteMany({
      where: { email: 'juan@example.com' },
    })
  })

  it('acepta una postulación válida sin exponer el archivo', async () => {
    const response = await sendFields()

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).not.toHaveProperty('fileData')
    expect(response.body).not.toHaveProperty('originalFileName')

    const created = await prisma.jobApplication.findUnique({
      where: { id: response.body.id },
    })
    expect(created).not.toBeNull()
    expect(created?.position).toBe('Aseador')
    expect(created?.dataConsentAcceptedAt).toEqual(expect.any(Date))
    expect(created?.fileData.length).toBe(1024)
  })

  it('requiere autorización de datos personales (consent)', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/apply')
      .field('name', 'Juan Pérez')
      .field('position', 'Aseador')
      .field('email', 'juan@example.com')
      .field('phone', '3001234567')
      .attach('cv', fakePdf(), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(response.body.error.message).toContain('autorizar')
  })

  it('rechaza la hoja de vida si no es un archivo PDF', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/apply')
      .field('name', 'Juan Pérez')
      .field('position', 'Aseador')
      .field('email', 'juan@example.com')
      .field('phone', '3001234567')
      .field('consent', 'on')
      .attach('cv', Buffer.from('not a pdf'), {
        filename: 'cv.txt',
        contentType: 'text/plain',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(response.body.error.message).toContain('PDF')
  })

  it('rechaza un archivo de más de 5 MB', async () => {
    const response = await sendFields({}, fakePdf('x', 6 * 1024 * 1024))

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(response.body.error.message).toContain('5 MB')
  })

  it('ignora postulaciones con honeypot completado (falso éxito sin guardar)', async () => {
    const response = await sendFields({ website: 'https://spam.example' })

    expect(response.status).toBe(201)

    const created = await prisma.jobApplication.count({
      where: { email: 'juan@example.com' },
    })
    expect(created).toBe(0)
  })

  it('valida mal el teléfono con 400', async () => {
    const response = await sendFields({ phone: 'ABA' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })
})

describe('Acceso administrativo a postulaciones', () => {
  let agent: ReturnType<typeof request.agent>
  let applicationId: string

  beforeEach(async () => {
    agent = request.agent(app)
    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })

    const application = await prisma.jobApplication.create({
      data: {
        id: 'b2000000-0000-4000-8000-000000000001',
        name: 'Juan Pérez',
        position: 'Aseador',
        email: 'juan.admin@example.com',
        phone: '3001234567',
        message: 'Disponibilidad inmediata',
        originalFileName: 'cv-admin.pdf',
        mimeType: 'application/pdf',
        fileSize: 64,
        fileData: Buffer.from('PDFBYTES'),
        dataConsentAcceptedAt: new Date(),
        companyId: TEST_COMPANY_ID,
      },
    })
    applicationId = application.id
  })

  afterEach(async () => {
    await prisma.jobApplication.deleteMany({
      where: { id: { startsWith: 'b2000000' } },
    })
  })

  it('lista postulaciones sin exponer fileData', async () => {
    const response = await agent.get('/api/v1/admin/jobs')

    expect(response.status).toBe(200)
    const item = response.body.find(
      (application: { id: string }) => application.id === applicationId,
    )
    expect(item).toBeDefined()
    expect(item).not.toHaveProperty('fileData')
    expect(item.name).toBe('Juan Pérez')
  })

  it('permite descargar la hoja de vida como admin', async () => {
    const response = await agent.get(`/api/v1/admin/jobs/${applicationId}/file`)

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('application/pdf')
    expect(response.headers['cache-control']).toContain('no-store')
    expect(response.body.toString()).toBe('PDFBYTES')
  })

  it('bloquea la descarga sin sesión (401)', async () => {
    const response = await request(app).get(
      `/api/v1/admin/jobs/${applicationId}/file`,
    )
    expect(response.status).toBe(401)
  })

  it('bloquea la descarga a un usuario no admin (403)', async () => {
    const staffAgent = request.agent(app)
    await staffAgent
      .post('/api/v1/auth/login')
      .send({ email: TEST_AGENT_EMAIL, password: TEST_PASSWORD })

    const response = await staffAgent.get(
      `/api/v1/admin/jobs/${applicationId}/file`,
    )
    expect(response.status).toBe(403)
  })

  it('marca como revisada y elimina una postulación', async () => {
    const reviewed = await agent.patch(`/api/v1/admin/jobs/${applicationId}`)
    expect(reviewed.status).toBe(200)
    expect(reviewed.body.status).toBe('REVIEWED')
    expect(reviewed.body.read).toBe(true)

    const deleted = await agent.delete(`/api/v1/admin/jobs/${applicationId}`)
    expect(deleted.status).toBe(204)
    expect(
      await prisma.jobApplication.findUnique({ where: { id: applicationId } }),
    ).toBeNull()
  })
})

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_AGENT_EMAIL] } },
  })
  await prisma.jobApplication.deleteMany({ where: { companyId: TEST_COMPANY_ID } })
  await prisma.company.deleteMany({ where: { id: TEST_COMPANY_ID } })
  await prisma.$disconnect()
})