import { hashSync } from 'bcryptjs'
import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'
import { BCRYPT_ROUNDS } from './services/auth.service.js'

const app = createApp()

const TEST_USER_ID = 'd1b0c1b2-1234-4a1b-8f6f-0b0e0c0d0a01'
const TEST_EMAIL = 'admin.test@highclean.local'
const TEST_PASSWORD = 'test-admin-password-123'
const ROLE_NAME = 'admin'

beforeEach(async () => {
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

describe('POST /api/v1/auth/login', () => {
  it('inicia sesión y devuelve el usuario autenticado', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(response.status).toBe(200)
    expect(response.body.user).toMatchObject({
      email: TEST_EMAIL,
      role: ROLE_NAME,
    })
    expect(response.headers['set-cookie']).toBeDefined()
  })

  it('rechaza contraseña incorrecta con 401 sin revelar el campo', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'password-incorrecta' })

    expect(response.status).toBe(401)
    expect(response.body.error).toMatchObject({ code: 'AuthenticationError' })
  })

  it('rechaza un correo inexistente con el mismo mensaje genérico', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'no-existe@highclean.local', password: TEST_PASSWORD })

    expect(response.status).toBe(401)
    expect(response.body.error).toMatchObject({ code: 'AuthenticationError' })
    expect(response.body.error.message).toBe('Correo o contraseña incorrectos')
  })

  it('valida el cuerpo con 400 ValidationError', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'no-es-un-correo', password: '' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({ code: 'ValidationError' })
  })
})

describe('GET /api/v1/auth/me', () => {
  it('devuelve 401 sin sesión', async () => {
    const response = await request(app).get('/api/v1/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error).toMatchObject({ code: 'AuthenticationError' })
  })

  it('devuelve el usuario con sesión activa', async () => {
    const agent = request.agent(app)

    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    const response = await agent.get('/api/v1/auth/me')

    expect(response.status).toBe(200)
    expect(response.body.user).toMatchObject({
      email: TEST_EMAIL,
      role: ROLE_NAME,
    })
  })
})

describe('POST /api/v1/auth/logout', () => {
  it('cierra la sesión y la cookie queda inválida', async () => {
    const agent = request.agent(app)

    await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    const logout = await agent.post('/api/v1/auth/logout')

    expect(logout.status).toBe(204)

    const me = await agent.get('/api/v1/auth/me')

    expect(me.status).toBe(401)
  })
})