import 'dotenv/config'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const BACKEND_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
)

async function databaseNameFromUrl(url: string): Promise<string> {
  return url.split(/[?#]/)[0].split('/').pop() as string
}

async function ensureDatabase(testUrl: string, databaseName: string) {
  const serverUrl = new URL(testUrl)
  serverUrl.pathname = '/postgres'
  serverUrl.search = ''
  serverUrl.hash = ''

  const admin = new Client({ connectionString: serverUrl.toString() })
  await admin.connect()
  try {
    const exists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    )
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${databaseName}"`)
      console.log(`BD de test creada: ${databaseName}`)
    } else {
      console.log(`BD de test ya existía: ${databaseName}`)
    }
  } finally {
    await admin.end()
  }
}

async function main() {
  const testUrl = process.env.DATABASE_URL_TEST
  if (!testUrl) {
    throw new Error(
      'DATABASE_URL_TEST no está definida. Agrega la variable a .env (usa una BD distinta a la de desarrollo).',
    )
  }
  if (testUrl === process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL_TEST no puede ser igual a DATABASE_URL: las pruebas borran datos y no deben apuntar a la BD de desarrollo.',
    )
  }

  const databaseName = await databaseNameFromUrl(testUrl)
  console.log(`Objetivo: BD "${databaseName}" (${testUrl})`)

  await ensureDatabase(testUrl, databaseName)

  console.log('Aplicando migraciones a la BD de test...')
  execSync('npx prisma migrate deploy', {
    cwd: BACKEND_ROOT,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'inherit',
  })
  console.log('BD de test lista: schema actualizado (migrate deploy OK).')
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})