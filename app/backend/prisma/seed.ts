import { prisma } from '../src/lib/prisma.js'

async function main() {
  const existing = await prisma.company.findFirst()

  if (existing) {
    await prisma.company.update({
      where: { id: existing.id },
      data: { name: 'High Clean SAS' },
    })
  } else {
    await prisma.company.create({
      data: { name: 'High Clean SAS' },
    })
  }

  console.log('Seed completado: empresa High Clean SAS verificada.')
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })