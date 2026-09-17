import { hashSync } from 'bcryptjs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { BCRYPT_ROUNDS } from './services/auth.service.js'

const app = createApp()

const TEST_USER_ID = 'd1b0c1b2-2345-4a1b-8f6f-0b0e0c0d0a02'
const TEST_EMAIL = 'security.test@highclean.local'
const TEST_PASSWORD = 'test-security-password-456'
const ROLE_NAME = 'admin'
const ALLOWED_ORIGIN = 'http://localhost:5173'
const EVIL_ORIGIN = 'https://malicioso.example'

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { id: TEST_USER_ID } })

  const role = await prisma.role.upsert({
    where: { name: ROLE_NAME },
    create: { name: ROLE_NAME },
    update: {},
  })

  await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: hashSync(TEST_PASSWORD, BCRYPT_ROUNDS),
      roleId: role.id,
    },
  })
})

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: TEST_USER_ID } })
  await prisma.session.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

function sidFrom(headers: Record<string, string | string[] | undefined>) {
  const cookie = headers['set-cookie']
  const entry = Array.isArray(cookie)
    ? cookie.find((value) => value.startsWith('sid='))
    : cookie
  if (!entry) return null
  const sid = entry.split(';')[0]
  return sid ? sid.trim() : null
}

describe('requireSameOrigin (CSRF via Origin)', () => {
  it('rechaza con 403 una mutación con Origin no permitido antes de la validación', async () => {
    const response = await request(app)
      .post('/api/v1/contact')
      .set('Origin', EVIL_ORIGIN)
      .send({ name: 'A', email: 'a@b.co', message: 'hola' })

    expect(response.status).toBe(403)
    expect(response.body.error).toMatchObject({
      code: 'AuthorizationError',
      message: 'Origen de la solicitud no permitido',
    })
  })

  it('rechaza con 403 las mutaciones admin con Origin no permitido antes de la autenticación', async () => {
    const post = await request(app)
      .post('/api/v1/admin/services')
      .set('Origin', EVIL_ORIGIN)
      .send({})

    expect(post.status).toBe(403)

    const patch = await request(app)
      .patch('/api/v1/admin/services/servicio-inexistente')
      .set('Origin', EVIL_ORIGIN)

    expect(patch.status).toBe(403)
  })

  it('permite la mutación cuando el Origin coincide con CORS_ORIGIN', async () => {
    const response = await request(app)
      .post('/api/v1/contact')
      .set('Origin', ALLOWED_ORIGIN)
      .send({})

    expect(response.status).not.toBe(403)
    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })

  it('permite la mutación sin header Origin (curl, mismo origen, tests)', async () => {
    const response = await request(app)
      .post('/api/v1/contact')
      .send({})

    expect(response.status).not.toBe(403)
    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })

  it('rechaza con 403 una mutación admin con Origin permitido pero sin sesión (401 por autenticación)', async () => {
    const response = await request(app)
      .post('/api/v1/admin/services')
      .set('Origin', ALLOWED_ORIGIN)
      .send({})

    expect(response.status).not.toBe(403)
    expect(response.status).toBe(401)
    expect(response.body.error).toMatchObject({ code: 'AuthenticationError' })
  })

  it('nunca bloquea GET aunque el Origin no esté permitido', async () => {
    const health = await request(app)
      .get('/api/v1/health')
      .set('Origin', EVIL_ORIGIN)

    expect(health.status).toBe(200)

    const dashboard = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Origin', EVIL_ORIGIN)

    expect(dashboard.status).not.toBe(403)
    expect(dashboard.status).toBe(401)
  })
})

describe('Fijación de sesión (regenerate en login)', () => {
  it('regenera el sid en cada inicio de sesión', async () => {
    const agent = request.agent(app)

    const first = await agent
      .post('/api/v1/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    const sid1 = sidFrom(first.headers)

    const second = await agent
      .post('/api/v1/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    const sid2 = sidFrom(second.headers)

    expect(first.status).toBe(200)
    expect(sid1).not.toBeNull()
    expect(sid2).not.toBeNull()
    expect(sid1).not.toBe(sid2)

    const me = await agent.get('/api/v1/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.user).toMatchObject({ email: TEST_EMAIL })
  })
})

describe('Headers de seguridad en rutas sensibles', () => {
  it('devuelve noindex y no-store en las respuestas del panel admin (aunque no haya sesión)', async () => {
    const response = await request(app).get('/api/v1/admin/dashboard')

    expect(response.status).toBe(401)
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow')
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('devuelve noindex y no-store en el login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({})

    expect(response.status).toBe(400)
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow')
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('devuelve no-store en las rutas autenticadas de auth', async () => {
    const response = await request(app).get('/api/v1/auth/me')

    expect(response.status).toBe(401)
    expect(response.headers['cache-control']).toBe('no-store')
  })
})

describe('Content Security Policy del backend', () => {
  it('permite imágenes de data: y https: para la galería', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.headers['content-security-policy']).toContain(
      "img-src 'self' data: https:",
    )
  })
})