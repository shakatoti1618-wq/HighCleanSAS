import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import Seo from '../components/Seo.tsx'
import { useCompany } from '../hooks/useCompany.ts'
import type { Company } from '../lib/api.ts'
import { EASE } from '../lib/motion.ts'

interface Section {
  id: string
  title: string
  body: ReactNode
}

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

function buildSections(company: Company | null): Section[] {
  const legalName = company?.name ?? 'High Clean SAS'
  const contactEmail = company?.email ?? TODO_TEXT
  const contactPhone = company?.phone ?? TODO_TEXT

  return [
  {
    id: 'responsable',
    title: '1. Responsable del tratamiento',
    body: (
      <>
        <p className="text-slate-600">
          {legalName}
          {company?.nit ? `, NIT ${company.nit},` : ''} es responsable del
          tratamiento de los datos personales que usted suministra a través de
          este sitio web.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
          <li>Correo de contacto: {contactEmail}</li>
          <li>
            Dirección: TODO — dirección física o electrónica de la empresa
          </li>
          <li>Teléfono: {contactPhone}</li>
        </ul>
      </>
    ),
  },
  {
    id: 'finalidad',
    title: '2. Finalidad del tratamiento',
    body: (
      <>
        <p className="text-slate-600">
          Según el formulario que usted diligencie, sus datos personales serán
          usados para:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
          <li>
            <strong className="font-semibold text-brand-ink">
              Formulario de contacto:
            </strong>{' '}
            responder su solicitud de información o cotización de nuestros
            servicios.
          </li>
          <li>
            <strong className="font-semibold text-brand-ink">
              Formulario &quot;Trabaja con nosotros&quot;:
            </strong>{' '}
            evaluar su hoja de vida para procesos de selección de personal
            vigentes o futuros en High Clean SAS.
          </li>
        </ul>
        <p className="mt-3 text-slate-600">
          Sus datos no serán usados para fines distintos a los aquí descritos,
          ni serán vendidos ni cedidos a terceros para fines comerciales ajenos
          a High Clean SAS.
        </p>
      </>
    ),
  },
  {
    id: 'datos',
    title: '3. Datos que se recolectan',
    body: (
      <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
        <li>Nombre, correo electrónico, teléfono.</li>
        <li>Formulario de contacto: el mensaje que usted escriba.</li>
        <li>
          Formulario &quot;Trabaja con nosotros&quot;: cargo al que aplica,
          mensaje opcional, y el archivo de hoja de vida (PDF) que usted
          adjunte.
        </li>
      </ul>
    ),
  },
  {
    id: 'facultativo',
    title: '4. Carácter facultativo',
    body: (
      <p className="text-slate-600">
        Suministrar sus datos es voluntario. Sin embargo, si no los suministra,
        no será posible responder su solicitud de contacto ni evaluar su
        postulación laboral.
      </p>
    ),
  },
  {
    id: 'proveedores',
    title: '5. Uso de proveedores de servicios (encargados del tratamiento)',
    body: (
      <>
        <p className="text-slate-600">
          Para el funcionamiento del sitio, High Clean SAS utiliza proveedores
          tecnológicos que pueden procesar sus datos únicamente como encargados
          del tratamiento, bajo instrucción de High Clean SAS y nunca para fines
          propios:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
          <li>Servicio de alojamiento del sitio y la base de datos.</li>
          <li>
            Servicio de envío de notificaciones por correo electrónico (Resend),
            que puede procesar el correo enviado desde servidores fuera de
            Colombia, exclusivamente para hacer llegar el aviso de un nuevo
            mensaje o postulación a High Clean SAS.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'derechos',
    title: '6. Derechos del titular',
    body: (
      <>
        <p className="text-slate-600">Usted tiene derecho a:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado del uso dado a sus datos.</li>
          <li>
            Revocar la autorización y/o solicitar la supresión de sus datos,
            cuando no exista un deber legal o contractual que impida eliminarlos.
          </li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio
            (SIC) por infracciones a la Ley 1581 de 2012.
          </li>
        </ul>
        <p className="mt-3 text-slate-600">
          Para ejercer estos derechos, puede escribir a: {contactEmail}
        </p>
      </>
    ),
  },
  {
    id: 'vigencia',
    title: '7. Vigencia',
    body: (
      <p className="text-slate-600">
        Sus datos serán conservados mientras sea necesario para la finalidad del
        tratamiento descrita, o hasta que usted solicite su supresión conforme
        al punto 6.
      </p>
    ),
  },
  ]
}

function PoliticaDeDatos() {
  const { company } = useCompany()
  const sections = buildSections(company)

  return (
    <section
      className="relative bg-white/60 py-24"
      aria-labelledby="politica-title"
    >
      <Seo
        title="Política de Tratamiento de Datos Personales — High Clean SAS"
        description="Política de Tratamiento de Datos Personales de High Clean SAS conforme a la Ley 1581 de 2012."
        canonicalPath="/politica-de-datos"
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-gold" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-goldDeep">
              Privacidad y datos personales
            </p>
          </div>
          <h1
            id="politica-title"
            className="mb-6 text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
          >
            Política de Tratamiento de Datos Personales — High Clean SAS
          </h1>
          <p className="mb-12 leading-relaxed text-slate-500">
            Documento de carácter informativo preparado siguiendo la estructura
            exigida por la Ley 1581 de 2012 (Colombia), artículos 9 y 12.
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <article
                key={section.id}
                className="rounded-2xl border border-brand-turqSoft bg-white p-7 shadow-sm md:p-8"
              >
                <h2 className="mb-3 font-display text-xl font-semibold text-brand-ink">
                  {section.title}
                </h2>
                <div className="space-y-0 text-sm leading-relaxed">
                  {section.body}
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PoliticaDeDatos