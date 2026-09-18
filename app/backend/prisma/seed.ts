import { hashSync } from 'bcryptjs'
import { env } from '../src/config/env.js'
import { prisma } from '../src/lib/prisma.js'
import { BCRYPT_ROUNDS } from '../src/services/auth.service.js'

const COMPANY_VALUES: { name: string; description: string }[] = [
  {
    name: 'Responsabilidad',
    description: 'Asumir compromisos y rendir cuentas por los resultados.',
  },
  {
    name: 'Innovación',
    description: 'Fomentar la creatividad, la mejora continua y la adaptación al cambio.',
  },
  {
    name: 'Orientación al cliente',
    description:
      'Colocar las necesidades y satisfacción del cliente en el centro de las decisiones.',
  },
  {
    name: 'Trabajo en equipo',
    description:
      'Colaborar de forma efectiva, compartiendo conocimientos y respetando la diversidad.',
  },
  {
    name: 'Excelencia',
    description:
      'Buscar constantemente los más altos estándares de calidad y desempeño.',
  },
  {
    name: 'Sostenibilidad',
    description:
      'Operar de manera responsable con el medio ambiente y la comunidad.',
  },
  {
    name: 'Respeto',
    description: 'Valorar a cada persona, promover la inclusión y actuar con empatía.',
  },
]

const COMPANY_DESCRIPTION = `High Clean S.A.S. es una empresa especializada en la prestación de servicios generales y asistenciales, con amplia experiencia en el suministro de personal calificado para hogares, empresas y conjuntos residenciales.
Ofrecemos soluciones integrales en aseo general, limpieza y mantenimiento de oficinas, conjuntos residenciales, zonas comunes, hogares, hoteles, clínicas e instituciones, garantizando espacios limpios, seguros y en óptimas condiciones.
Además, prestamos servicios de cuidado y acompañamiento de adultos mayores, niños y apoyo asistencial, brindando atención responsable, humana y personalizada.
Nos caracterizamos por nuestro compromiso, responsabilidad y profesionalismo, respaldados por un equipo de trabajo capacitado que garantiza un servicio de alta calidad, adaptado a las necesidades de cada cliente.`

const COMPANY_MISSION = `Somos una empresa especializada en ofrecer servicios generales de cuidado para adultos mayores y niños, así como en la realización de aseo general en hogares, oficinas, hoteles y zonas comunes. Nos comprometemos a satisfacer las necesidades de nuestros clientes con un enfoque en la calidad y el detalle de cada servicio.
Nos enfocamos en crear un ambiente seguro, confiable y agradable, garantizando siempre el bienestar y la tranquilidad de quienes confían en nosotros para su cuidado y mantenimiento. Nuestra misión es ofrecer un servicio excepcional que proporcione comodidad y satisfacción a todos nuestros clientes.`

const COMPANY_VISION = `Queremos posicionarnos como la empresa líder a nivel nacional, reconocida por la eficiencia y efectividad en la prestación de nuestros servicios. Nuestro objetivo es ofrecer soluciones integrales que mejoren continuamente nuestros productos y la atención al cliente.
Nos comprometemos con la sostenibilidad y el desarrollo constante, buscando siempre la excelencia en todo lo que hacemos para garantizar la satisfacción y confianza de nuestros clientes.`

const COMPANY_QUALITY_POLICY = `En nuestra empresa, nos comprometemos a mejorar continuamente el desempeño de nuestros servicios, a través de una planificación adecuada, un riguroso seguimiento y control de nuestros procesos. Aplicamos estrictos estándares de seguridad y salud en el trabajo, así como de seguridad industrial, garantizando un entorno seguro tanto para nuestros colaboradores como para nuestros clientes.
Así mismo, nos enfocamos en la capacitación constante de nuestro personal, para asegurar su desarrollo profesional y su alineación con las mejores prácticas. Nos comprometemos a cumplir con los requerimientos de nuestros clientes y a superar sus expectativas, trabajando de manera integral para brindar soluciones de calidad.`

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
          data: {
            name: 'High Clean SAS',
            description: COMPANY_DESCRIPTION,
            mission: COMPANY_MISSION,
            vision: COMPANY_VISION,
            qualityPolicy: COMPANY_QUALITY_POLICY,
            values: COMPANY_VALUES,
            whatsappNumber: '+573209498347',
          },
        })
      ).id
    : (
        await prisma.company.create({
          data: {
            name: 'High Clean SAS',
            description: COMPANY_DESCRIPTION,
            mission: COMPANY_MISSION,
            vision: COMPANY_VISION,
            qualityPolicy: COMPANY_QUALITY_POLICY,
            values: COMPANY_VALUES,
            whatsappNumber: '+573209498347',
          },
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