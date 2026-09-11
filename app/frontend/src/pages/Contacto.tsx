import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

const contactItems = [
  { icon: Phone, label: 'Teléfono' },
  { icon: Mail, label: 'Correo electrónico' },
  { icon: MapPin, label: 'Dirección' },
]

function Contacto() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Envío real se implementa en el Módulo 9 (Contacto, backend).
  }

  return (
    <section
      className="relative bg-white/60 py-24"
      aria-labelledby="contacto-title"
    >
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
              {TODO_TEXT}
            </p>

            <address className="mb-10 space-y-5 not-italic">
              {contactItems.map(({ icon: Icon, label }) => (
                <p key={label} className="flex items-center gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-turq/30 bg-brand-turq/10"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5 text-brand-turqDeep" />
                  </span>
                  <span className="text-brand-ink">
                    {label}: pendiente de confirmar
                  </span>
                </p>
              ))}
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
              <button
                type="submit"
                className="w-full rounded-sm bg-brand-turq py-4 font-semibold text-white shadow-md transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2"
              >
                Enviar mensaje
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contacto