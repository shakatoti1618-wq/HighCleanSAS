import { S3Client } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import { StorageError } from '../utils/httpError.js'

function assertR2Configured() {
  const required: Array<[string, string | undefined]> = [
    ['R2_ACCOUNT_ID', env.R2_ACCOUNT_ID],
    ['R2_ACCESS_KEY_ID', env.R2_ACCESS_KEY_ID],
    ['R2_SECRET_ACCESS_KEY', env.R2_SECRET_ACCESS_KEY],
    ['R2_ENDPOINT', env.R2_ENDPOINT],
    ['R2_BUCKET_NAME', env.R2_BUCKET_NAME],
    ['R2_PUBLIC_BASE_URL', env.R2_PUBLIC_BASE_URL],
  ]

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    throw new StorageError(
      `Almacenamiento R2 no configurado (faltan: ${missing.join(', ')})`,
    )
  }
}

let client: S3Client | null = null

export function getR2Client(): S3Client {
  assertR2Configured()
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },
    })
  }
  return client
}