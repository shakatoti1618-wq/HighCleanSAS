import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import DataConsentCheckbox from '../components/DataConsentCheckbox.tsx'
import { applyJob } from '../lib/jobs.ts'
import { EASE } from '../lib/motion.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

const initialForm = {
  name: '',
  position: '',
  email: '',
  phone: '',
  message: '',
  website: '',
}

function TrabajaConNosotros() {
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState<File | null>(null)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    if (!file) {
      setError('Adjunta tu hoja de vida en formato PDF.')
      return
    }

    if (!consent) {
      setError('Debes autorizar el tratamiento de tus datos personales.')
      return
    }

    setSubmitting(true)
    setSent(false)
    setError(null)

    try {
      await applyJob({
        name: form.name,
        position: form.position,
        email: form.email,
        phone: form.phone,
        message: form.message || undefined,
        website: form.website,
        consent,
        file,
      })
      setSent(true)
      setForm(initialForm)
      setFile(null)
      setConsent(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo enviar tu postulación. Intenta de nuevo más tarde.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="relative bg-white/60 py-24"
      aria-labelledby="trabaja-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-brand-gold" aria-hidden="true" />
              <p className="text-sm font-medium text-brand-goldDeep">
                Talento humano
              </p>
            </div>
            <h1
              id="trabaja-title"
              className="mb-6 text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
            >
              Trabaja con nosotros
            </h1>
            <p className="mb-10 max-w-lg leading-relaxed text-slate-600">
              {TODO_TEXT}
            </p>

            <div className="rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md">
              <h2 className="flex items-center gap-3 font-display text-lg font-semibold text-brand-ink">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-sm bg-brand-turq/10"
                  aria-hidden="true"
                >
                  <FileText className="h-5 w-5 text-brand-turqDeep" />
                </span>
                ¿Qué debes adjuntar?
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Tu hoja de vida en formato PDF (máximo 5 MB).</li>
                <li>El cargo al que aplicas.</li>
                <li>
                  Tu autorización para el tratamiento de datos personales
                  conforme a la{' '}
                  <a
                    href="/politica-de-datos"
                    className="font-medium text-brand-turqDeep underline underline-offset-2"
                  >
                    Política de Tratamiento de Datos Personales
                  </a>
                  .
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="rounded-sm border border-brand-turqSoft bg-white p-7 shadow-xl md:p-9"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2 className="mb-6 font-display text-xl font-semibold text-brand-ink">
              Envía tu hoja de vida
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="jobs-website">
                  Déjalo vacío (campo anti-spam)
                </label>
                <input
                  id="jobs-website"
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
                  Nombre completo
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
                  Cargo al que aplica
                </span>
                <input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Ej.: Operario de aseo"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
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
                    Teléfono
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                  Mensaje (opcional)
                </span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                  Hoja de vida (PDF, máximo 5 MB)
                </span>
                <input
                  type="file"
                  name="cv"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  required
                  className="block w-full cursor-pointer rounded-sm border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-sm file:border-0 file:bg-brand-turq file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq"
                />
                {file && (
                  <span className="mt-1.5 block truncate text-xs text-slate-500">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                )}
              </label>

              <DataConsentCheckbox
                id="jobs-consent"
                context="job"
                checked={consent}
                onChange={setConsent}
                required
              />

              {sent && (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-sm border border-brand-leaf/40 bg-brand-leaf/10 px-4 py-3 text-sm font-medium text-brand-leafDeep"
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Postulación enviada. Revisaremos tu hoja de vida y te
                  contactaremos si tu perfil se ajusta al cargo.
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
                {submitting ? 'Enviando…' : 'Enviar postulación'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default TrabajaConNosotros