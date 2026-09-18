import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle2, Clock, Loader2, Map, Mail, MapPin, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import DataConsentCheckbox from '../components/DataConsentCheckbox.tsx'
import Seo from '../components/Seo.tsx'
import { useCompany } from '../hooks/useCompany.ts'
import { EASE } from '../lib/motion.ts'
import { sendContactMessage } from '../lib/api.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const CONTACT_SUBTITLE =
  'Elige el canal que prefieras y te responderemos a la brevedad.'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

const contactItems = [
  { icon: Phone, label: 'Teléfono', key: 'phone' },
  { icon: Mail, label: 'Correo electrónico', key: 'email' },
  { icon: MapPin, label: 'Dirección', key: 'address' },
] as const

type ContactKey = (typeof contactItems)[number]['key']

function Contacto() {
  const { company } = useCompany()
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setSent(false)
    setError(null)

    try {
      await sendContactMessage({
        name: form.name,
        email: form.email,
        message: form.message,
        website: form.website,
      })
      setSent(true)
      setForm({ name: '', email: '', message: '', website: '' })
      setConsent(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const valueFor = (key: ContactKey) => {
    const value = company?.[key]
    return value ?? 'pendiente de confirmar'
  }

  const coverageCities =
    company?.serviceCities && company.serviceCities.length > 0
      ? company.serviceCities.join(', ')
      : 'pendiente de confirmar'

  return (
    <section
      className="relative bg-white/60 py-24"
      aria-labelledby="contacto-title"
    >
      <Seo
        title="Contacto — High Clean SAS"
        description="Contacta con High Clean SAS para solicitar una cotización de servicios de aseo y limpieza."
        canonicalPath="/contacto"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-brand-gold" aria-hidden="true" />
              <p className="text-sm font-medium text-brand-goldDeep">Contacto</p>
            </div>
            <h1
              id="contacto-title"
              className="mb-6 text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
            >
              Contacto
            </h1>
            <p className="mb-10 max-w-lg leading-relaxed text-slate-600">
              {company?.phone || company?.email ? CONTACT_SUBTITLE : TODO_TEXT}
            </p>

            <address className="mb-10 space-y-5 not-italic">
              {contactItems.map(({ icon: Icon, label, key }) => (
                <p key={label} className="flex items-center gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-turq/30 bg-brand-turq/10"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5 text-brand-turqDeep" />
                  </span>
                  <span className="text-brand-ink">
                    {label}: {valueFor(key)}
                  </span>
                </p>
              ))}
              <p className="flex items-center gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-turq/30 bg-brand-turq/10"
                  aria-hidden="true"
                >
                  <Map className="h-5 w-5 text-brand-turqDeep" />
                </span>
                <span className="text-brand-ink">
                  Cobertura: {coverageCities}
                </span>
              </p>
              <p className="flex items-center gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-turq/30 bg-brand-turq/10"
                  aria-hidden="true"
                >
                  <Clock className="h-5 w-5 text-brand-turqDeep" />
                </span>
                <span className="whitespace-pre-line text-brand-ink">
                  Horarios: {company?.schedules ?? 'pendiente de confirmar'}
                </span>
              </p>
            </address>
          </motion.div>

          <motion.div
            className="rounded-sm border border-brand-turqSoft bg-white p-7 shadow-xl md:p-9"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="mb-6 font-display text-xl font-semibold text-brand-ink">
              Envíanos un mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-website">
                  Déjalo vacío (campo anti-spam)
                </label>
                <input
                  id="contact-website"
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                  Nombre
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                  Mensaje
                </span>
<textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
              </label>

              <DataConsentCheckbox
                id="contact-consent"
                context="contact"
                checked={consent}
                onChange={setConsent}
              />

              {sent && (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-sm border border-brand-leaf/40 bg-brand-leaf/10 px-4 py-3 text-sm font-medium text-brand-leafDeep"
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Mensaje enviado. Te responderemos pronto.
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-turq py-4 font-semibold text-white shadow-md transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {submitting ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contacto