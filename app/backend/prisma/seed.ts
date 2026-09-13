import { prisma } from '../src/lib/prisma.js'

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
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })