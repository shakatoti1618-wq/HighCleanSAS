import { hashSync } from 'bcryptjs'
import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { BCRYPT_ROUNDS } from './services/auth.service.js'

vi.mock('./services/storage.service.js', () => ({
  uploadObject: vi.fn(),
  deleteObjectIfManaged: vi.fn(),
}))

import { deleteObjectIfManaged, uploadObject } from './services/storage.service.js'

const app = createApp()

const TEST_PASSWORD = 'test-admin-password-123'
const TEST_ADMIN_EMAIL = 'admin.r2@highclean.local'
const TEST_COMPANY_ID = 'a7000000-0000-4000-8000-000000000001'
const TEST_COMPANY_NAME = 'High Clean SAS Test R2'

const upload = vi.mocked(uploadObject)
const removeObject = vi.mocked(deleteObjectIfManaged)

let agent: ReturnType<typeof request.agent>

beforeEach(async () => {
  await prisma.session.deleteMany()
  await prisma.review.deleteMany()
  await prisma.user.deleteMany({ where: { email: TEST_ADMIN_EMAIL } })
  await prisma.service.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.company.deleteMany({
    where: { NOT: { services: { some: {} } } },
  })

  await prisma.company.create({
    data: { id: TEST_COMPANY_ID, name: TEST_COMPANY_NAME, serviceCities: [] },
  })

  const role = await prisma.role.upsert({
    where: { name: 'admin' },
    create: { name: 'admin' },
    update: {},
  })

  await prisma.user.create({
    data: {
      email: TEST_ADMIN_EMAIL,
      passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
      roleId: role.id,
    },
  })

  agent = request.agent(app)
  await agent
    .post('/api/v1/auth/login')
    .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD })

  upload.mockReset()
  upload.mockImplementation(async (_key: string, _body: Uint8Array, _mimetype: string) => ({
    key: `objects/dummy-${Math.random().toString(36).slice(2)}`,
    url: `https://media.highcleansas.com/objects/${Math.random().toString(36).slice(2)}`,
  }))
  removeObject.mockReset()
  removeObject.mockResolvedValue(undefined)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/v1/admin/services/:id/photo', () => {
  it('requiere sesión de administrador', async () => {
    const response = await request(app)
      .post('/api/v1/admin/services/x/photo')
      .attach('file', Buffer.from('DATA'), { filename: 'hogar.jpeg', contentType: 'image/jpeg' })

    expect(response.status).toBe(401)
  })

  it('sube una imagen a R2 y asigna la URL al servicio', async () => {
    const service = await prisma.service.create({
      data: { name: 'Aseo del Hogar', companyId: TEST_COMPANY_ID },
    })

    const response = await agent
      .post(`/api/v1/admin/services/${service.id}/photo`)
      .attach('file', Buffer.from('FOTO'), { filename: 'hogar.jpeg', contentType: 'image/jpeg' })

    expect(response.status).toBe(200)
    expect(response.body.imageUrl).toMatch(/^https:\/\/media\.highcleansas\.com\//)
    expect(upload).toHaveBeenCalledTimes(1)
    const [key, body, contentType] = upload.mock.calls[0] as [
      string,
      Uint8Array,
      string,
    ]
    expect(key).toBe('services/aseo-del-hogar.jpeg')
    expect(contentType).toBe('image/jpeg')
    expect(body).toBeInstanceOf(Uint8Array)

    const updated = await prisma.service.findUnique({ where: { id: service.id } })
    expect(updated?.imageUrl).toBe(response.body.imageUrl)
  })

  it('rechaza archivos que no sean imágenes', async () => {
    const service = await prisma.service.create({
      data: { name: 'Planchado', companyId: TEST_COMPANY_ID },
    })

    const response = await agent
      .post(`/api/v1/admin/services/${service.id}/photo`)
      .attach('file', Buffer.from('TXT'), { filename: 'nota.txt', contentType: 'text/plain' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(upload).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/admin/gallery/upload', () => {
  it('sube una imagen y crea una GalleryImage type=IMAGE', async () => {
    const response = await agent
      .post('/api/v1/admin/gallery/upload')
      .field('alt', 'Oficina limpia')
      .attach('file', Buffer.from('IMAGEN'), { filename: 'oficinas.jpeg', contentType: 'image/jpeg' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      type: 'IMAGE',
      alt: 'Oficina limpia',
    })
    expect(response.body.url).toMatch(/^https:\/\/media\.highcleansas\.com\//)

    const [key] = upload.mock.calls[0] as [string, Uint8Array, string]
    expect(key).toBe('gallery/oficinas.jpeg')
  })

  it('sube un video y crea una GalleryImage type=VIDEO', async () => {
    const response = await agent
      .post('/api/v1/admin/gallery/upload')
      .attach('file', Buffer.from('VIDEO'), { filename: 'galeria9.mp4', contentType: 'video/mp4' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ type: 'VIDEO' })

    const [key] = upload.mock.calls[0] as [string, Uint8Array, string]
    expect(key).toBe('gallery/galeria9.mp4')
  })

  it('rechaza extensiones no permitidas', async () => {
    const response = await agent
      .post('/api/v1/admin/gallery/upload')
      .attach('file', Buffer.from('PDF'), { filename: 'documento.pdf', contentType: 'application/pdf' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
    expect(upload).not.toHaveBeenCalled()
  })

  it('requiere sesión de administrador', async () => {
    const response = await request(app)
      .post('/api/v1/admin/gallery/upload')
      .attach('file', Buffer.from('IMAGEN'), { filename: 'galeria1.jpeg', contentType: 'image/jpeg' })

    expect(response.status).toBe(401)
  })
})

describe('limpieza del objeto en R2 al borrar', () => {
  it('elimina el objeto almacenado al borrar una imagen de galería', async () => {
    await prisma.galleryImage.create({
      data: {
        url: 'https://media.highcleansas.com/gallery/galeria1.jpeg',
        companyId: TEST_COMPANY_ID,
      },
    })

    const list = await agent.get('/api/v1/admin/gallery')
    const image = (list.body as { id: string }[])[0]
    if (!image) {
      throw new Error('No se pudo resolver la imagen de galería en el test')
    }

    const response = await agent.delete(`/api/v1/admin/gallery/${image.id}`)

    expect(response.status).toBe(204)
    expect(removeObject).toHaveBeenCalledWith(
      'https://media.highcleansas.com/gallery/galeria1.jpeg',
    )
  })
})