import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import { getR2Client } from '../lib/r2.js'
import { StorageError } from '../utils/httpError.js'

export interface UploadedObject {
  key: string
  url: string
}

export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<UploadedObject> {
  const publicBase = env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '')

  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
  } catch {
    throw new StorageError('No se pudo subir el archivo a R2')
  }

  return { key, url: `${publicBase}/${key}` }
}

export async function deleteObjectIfManaged(url: string): Promise<void> {
  const publicBase = env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '')
  if (!publicBase || !url.startsWith(`${publicBase}/`)) return

  const key = url.slice(publicBase.length + 1)
  if (!key) return

  try {
    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      }),
    )
  } catch {
    throw new StorageError('No se pudo eliminar el archivo de R2')
  }
}