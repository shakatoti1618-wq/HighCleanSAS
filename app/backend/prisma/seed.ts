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

const COMPANY_PHONE = '+573209498347'
const COMPANY_NIT = '901330960-1'
const COMPANY_EMAIL = 'cotizaciones@highcleansas.com'
const COMPANY_SERVICE_CITIES = [
  'Bogotá',
  'Villavicencio',
  'Bucaramanga',
  'Medellín',
  'Cartagena',
  'Fusagasugá',
]
const COMPANY_SCHEDULES =
  'Lunes a viernes: 8:00 am a 5:00 pm\nSábado y domingo: 8:00 am a 12:00 pm'

const COMPANY_STATS = {
  activeClients: 500,
  yearsOperating: 8,
  monthlyServices: 700,
}

const MEDIA_BASE_URL = 'https://media.highcleansas.com'

const SERVICE_MEDIA_SLUGS: Record<string, string> = {
  'Aseo del Hogar': 'aseo-del-hogar',
  'Planchado': 'planchado',
  'Cuidado Adulto Mayor': 'cuidado-de-adulto-mayor',
  'Aseo Conjuntos Residenciales': 'conjuntos-residenciales',
  'Niñera': 'nineras',
  'Aseo de Oficinas': 'oficinas',
  'Limpieza Airbnb': 'alquiler-vacacional-airbnb',
}

const GALLERY_SEED = Array.from({ length: 8 }, (_, index) => ({
  url: `${MEDIA_BASE_URL}/gallery/galeria${index + 1}.jpeg`,
  alt: `Galería de High Clean — imagen ${index + 1}`,
})).concat({
  url: `${MEDIA_BASE_URL}/gallery/galeria9.mp4`,
  alt: 'Galería de High Clean — video de ejemplo',
  type: 'VIDEO',
})

interface ServiceOptionSeed {
  label: string
  price: number
  note?: string
  group?: string
  sortOrder: number
}

interface ServiceSeed {
  name: string
  legacyNames: string[]
  description: string
  options: ServiceOptionSeed[]
}

const SERVICES_SEED: ServiceSeed[] = [
  {
    name: 'Aseo del Hogar',
    legacyNames: ['Aseo del Hogar'],
    description: `En High Clean, nuestras profesionales están capacitadas para dejar tu hogar impecable y organizado, adaptándose exactamente a lo que necesitas.

Funciones principales:
- Limpieza profunda y desinfección de baños y cocina.
- Barrido, trapeado y aspirado de pisos en todas las áreas.
- Limpieza de polvo en muebles, repisas y superficies.
- Organización general de habitaciones, sala y comedor.`,
    options: [
      { label: 'Tiempo Completo Externa (7h)', price: 3350000, sortOrder: 1 },
      { label: 'Tiempo Completo Interna (7h)', price: 3200000, sortOrder: 2 },
      { label: 'Medio Tiempo (3.5h)', price: 2200000, note: 'Incluye planchado', sortOrder: 3 },
      { label: 'Por Días (7h)', price: 135000, note: 'Sin planchado', sortOrder: 4 },
    ],
  },
  {
    name: 'Planchado',
    legacyNames: ['Planchado'],
    description: `Servicio especializado de planchado: atención meticulosa a todo tipo de prendas, desde camisas de trabajo y blusas delicadas, hasta pantalones, uniformes y ropa de cama. Es la opción perfecta para familias numerosas, para poner al día la acumulación de ropa de la semana, o simplemente para quienes desean delegar una de las tareas más agotadoras del hogar y recuperar su tiempo libre.

Incluye:
- Planchado profesional de todo tipo de prendas.
- Clasificación previa de la ropa y ajuste de temperatura según el tipo de tejido.
- Doblado perfecto o colgado directo en ganchos.
- Eliminación de arrugas difíciles en cuellos, puños, pliegues y bordes.`,
    options: [{ label: 'Planchado (5h)', price: 130000, sortOrder: 1 }],
  },
  {
    name: 'Cuidado Adulto Mayor',
    legacyNames: ['Cuidado de Adulto Mayor'],
    description: `Cuidado integral y acompañamiento para adultos mayores, adaptado a las necesidades de cada familia. Nuestro servicio está orientado a brindar acompañamiento, atención, seguridad y bienestar, procurando siempre un trato respetuoso, cálido y humano.

Modalidades:
- Interna: acompañamiento y cuidado permanente en el hogar, con atención durante el tiempo acordado con la familia (sin auxilio de transporte en este servicio).
- Externa: cuidado y acompañamiento durante el día, sin permanencia en el domicilio.`,
    options: [
      {
        label: 'Externa',
        price: 3350000,
        note: 'Si el paciente requiere enfermera, el precio se cotiza aparte según las funciones requeridas',
        sortOrder: 1,
      },
      { label: 'Interna', price: 3250000, sortOrder: 2 },
    ],
  },
  {
    name: 'Aseo Conjuntos Residenciales',
    legacyNames: ['Conjuntos Residenciales'],
    description: `Personal capacitado para mantener en óptimas condiciones las áreas comunes de tu conjunto.

Funciones principales:
- Limpieza de zonas comunes.
- Barrido y trapeado.
- Limpieza de escaleras y pasillos.
- Limpieza de baños y áreas sociales.
- Recolección y manejo adecuado de residuos.
- Limpieza de vidrios y superficies.
- Apoyo en el mantenimiento de áreas.`,
    options: [
      { label: 'Tiempo Completo', price: 3450000, group: 'Generales', sortOrder: 1 },
      { label: 'Medio Tiempo', price: 2200000, group: 'Generales', sortOrder: 2 },
      { label: 'Por Días', price: 150000, group: 'Generales', sortOrder: 3 },
      { label: 'Tiempo Completo', price: 3700000, group: 'Todero', sortOrder: 4 },
      { label: 'Medio Tiempo', price: 2500000, group: 'Todero', sortOrder: 5 },
      {
        label: 'Por Días',
        price: 180000,
        group: 'Todero',
        note: 'Exclusivamente para apoyo puntual',
        sortOrder: 6,
      },
    ],
  },
  {
    name: 'Niñera',
    legacyNames: ['Niñeras'],
    description: `Personal de confianza para el cuidado y acompañamiento de los más pequeños.

Funciones:
- Cuidado y supervisión de los niños.
- Acompañamiento en sus actividades diarias.
- Preparación y apoyo durante las comidas.
- Organización de sus espacios.
- Acompañamiento en tareas y actividades.
- Apoyo en rutinas y horarios.`,
    options: [
      {
        label: 'Tiempo Completo Externa',
        price: 3350000,
        note: 'La niñera trabaja y se va a su casa',
        sortOrder: 1,
      },
      {
        label: 'Tiempo Completo Interna',
        price: 3200000,
        note: 'Se queda a dormir en el domicilio del cliente',
        sortOrder: 2,
      },
      { label: 'Por Días', price: 145000, sortOrder: 3 },
      { label: 'Medio Tiempo', price: 2200000, sortOrder: 4 },
    ],
  },
  {
    name: 'Aseo de Oficinas',
    legacyNames: ['Oficinas'],
    description: `Personal para mantener tus espacios de trabajo limpios, organizados y agradables.

Incluye:
- Limpieza y desinfección de oficinas.
- Barrido y trapeado.
- Limpieza de escritorios y superficies.
- Limpieza de baños y áreas comunes.
- Limpieza de vidrios.
- Manejo de residuos.
- Organización general de los espacios.`,
    options: [
      { label: 'Tiempo Completo', price: 3350000, sortOrder: 1 },
      { label: 'Por Días', price: 135000, sortOrder: 2 },
      { label: 'Medio Tiempo (paquete)', price: 2200000, sortOrder: 3 },
      {
        label: 'Medio Tiempo por Día',
        price: 90000,
        note: 'Jornada suelta, no es el paquete',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Limpieza Airbnb',
    legacyNames: ['Alquiler Vacacional (Airbnb)'],
    description: `Personal para mantener tu Airbnb siempre limpio, organizado y listo para recibir a tus huéspedes.

Funciones:
- Limpieza y desinfección.
- Organización de habitaciones.
- Limpieza de baños y cocina.
- Cambio y organización de ropa de cama.
- Limpieza de áreas comunes.
- Preparación del espacio para nuevos huéspedes.`,
    options: [
      { label: 'Tiempo Completo (7h)', price: 135000, sortOrder: 1 },
      { label: 'Medio Tiempo (3.5h)', price: 105000, sortOrder: 2 },
    ],
  },
]

async function seedServices(companyId: string) {
  for (const serviceSeed of SERVICES_SEED) {
    const existing = await prisma.service.findFirst({
      where: { name: { in: [serviceSeed.name, ...serviceSeed.legacyNames] } },
    })

    const service = existing
      ? await prisma.service.update({
          where: { id: existing.id },
          data: { name: serviceSeed.name, description: serviceSeed.description },
        })
      : await prisma.service.create({
          data: {
            name: serviceSeed.name,
            description: serviceSeed.description,
            companyId,
          },
        })

    const mediaSlug = SERVICE_MEDIA_SLUGS[service.name]
    if (!service.imageUrl && mediaSlug) {
      await prisma.service.update({
        where: { id: service.id },
        data: { imageUrl: `${MEDIA_BASE_URL}/services/${mediaSlug}.jpeg` },
      })
    }

    const optionCount = await prisma.serviceOption.count({
      where: { serviceId: service.id },
    })

    if (optionCount === 0) {
      await prisma.serviceOption.createMany({
        data: serviceSeed.options.map((option) => ({
          ...option,
          serviceId: service.id,
        })),
      })
    }
  }

  console.log(
    'Seed: 7 servicios con descripciones y modalidades de precios verificados.',
  )
}

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
            phone: COMPANY_PHONE,
            nit: COMPANY_NIT,
            email: COMPANY_EMAIL,
            serviceCities: COMPANY_SERVICE_CITIES,
            schedules: COMPANY_SCHEDULES,
            activeClients: COMPANY_STATS.activeClients,
            yearsOperating: COMPANY_STATS.yearsOperating,
            monthlyServices: COMPANY_STATS.monthlyServices,
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
            phone: COMPANY_PHONE,
            nit: COMPANY_NIT,
            email: COMPANY_EMAIL,
            serviceCities: COMPANY_SERVICE_CITIES,
            schedules: COMPANY_SCHEDULES,
            activeClients: COMPANY_STATS.activeClients,
            yearsOperating: COMPANY_STATS.yearsOperating,
            monthlyServices: COMPANY_STATS.monthlyServices,
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

  const galleryCount = await prisma.galleryImage.count()

  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: GALLERY_SEED.map((item) => ({ ...item, companyId })),
    })
    console.log(
      'Seed: 9 archivos de galería (8 imágenes + 1 video) restaurados.',
    )
  }

  await seedServices(companyId)

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