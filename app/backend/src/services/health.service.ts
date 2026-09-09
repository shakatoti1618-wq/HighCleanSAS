import { prisma } from '../lib/prisma.js'

export async function getHealth() {
  let database: 'up' | 'down' = 'down'

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'up'
  } catch {
    database = 'down'
  }

  return {
    status: 'ok',
    database,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
}