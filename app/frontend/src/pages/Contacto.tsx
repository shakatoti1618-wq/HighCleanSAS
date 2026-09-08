import { useState, type ChangeEvent, type FormEvent } from 'react'

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
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-900">Contacto</h1>
      <p className="mt-2 text-slate-600">
        Correo, teléfono y dirección: TODO: información pendiente de confirmar con High Clean SAS.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-200 p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Nombre
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-sky-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-sky-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Mensaje
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-sky-600"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
        >
          Enviar mensaje
        </button>
      </form>
    </section>
  )
}

export default Contacto