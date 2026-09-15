import { hashSync } from 'bcryptjs'
import { env } from '../src/config/env.js'
import { prisma } from '../src/lib/prisma.js'
import { BCRYPT_ROUNDS } from '../src/services/auth.service.js'

async function seedAdminUser() {
  const adminEmail = env.ADMIN_EMAIL.toLowerCase()

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    create: { name: 'admin' },
    update: {},
  })

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existing) {
    console.log('Seed: usuario administrador existente conservado.')
    return
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashSync(env.ADMIN_PASSWORD, BCRYPT_ROUNDS),
      roleId: adminRole.id,
    },
  })

  console.log(`Seed: usuario administrador creado (${adminEmail}).`)
}

async function main() {
  const existing = await prisma.company.findFirst()

  const companyId = existing
    ? (
        await prisma.company.update({
          where: { id: existing.id },
          data: { name: 'High Clean SAS' },
        })
      ).id
    : (
        await prisma.company.create({
          data: { name: 'High Clean SAS' },
        })
      ).id

  const reviewCount = await prisma.review.count({
    where: { companyId },
  })

  if (reviewCount === 0) {
    const placeholder =
      'TODO: información pendiente de confirmar con High Clean SAS'

    await prisma.review.createMany({
      data: [
        {
          author: placeholder,
          content: placeholder,
          rating: 5,
          status: 'APPROVED',
          companyId,
        },
        {
          author: placeholder,
          content: placeholder,
          rating: 5,
          status: 'APPROVED',
          companyId,
        },
        {
          author: placeholder,
          content: placeholder,
          rating: 5,
          status: 'APPROVED',
          companyId,
        },
      ],
    })

    console.log(
      'Seed completado: empresa High Clean SAS y reseñas de ejemplo verificadas.',
    )
  } else {
    console.log(
      'Seed completado: empresa High Clean SAS verificada, reseñas existentes conservadas.',
    )
  }

  await seedAdminUser()
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })