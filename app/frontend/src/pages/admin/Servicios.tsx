import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Service } from '../../lib/api.ts'
import {
  createService,
  deleteService,
  fetchAdminServices,
  updateService,
} from '../../lib/admin.ts'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

function Servicios() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    void fetchAdminServices()
      .then((data) => setServices(data))
      .catch((fetchError: unknown) => {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'No se pudieron cargar los servicios',
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setEditing(null)
    setName('')
    setDescription('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (busy) return

    setBusy(true)
    setError(null)
    setSaved(false)

    try {
      if (editing) {
        const updated = await updateService(editing.id, name, description)
        setServices((previous) =>
          previous.map((service) => (service.id === updated.id ? updated : service)),
        )
      } else {
        const created = await createService(name, description)
        setServices((previous) => [...previous, created])
      }
      setSaved(true)
      resetForm()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'No se pudo guardar el servicio',
      )
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (service: Service) => {
    setEditing(service)
    setName(service.name)
    setDescription(service.description ?? '')
    setSaved(false)
  }

  const handleDelete = async (service: Service) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteService(service.id)
      setServices((previous) => previous.filter((item) => item.id !== service.id))
      if (editing?.id === service.id) resetForm()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar el servicio',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="servicios-title">
      <h1
        id="servicios-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Servicios
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Crea, edita y elimina los servicios que se muestran en tu sitio.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {saved && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-sm border border-brand-leaf/40 bg-brand-leaf/10 px-4 py-3 text-sm font-medium text-brand-leafDeep"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Servicio guardado.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            {editing ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancelar edición
            </button>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-ink">
            Nombre
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-ink">
            Descripción
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={2000}
            className={`${inputClass} resize-none`}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-turq px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {editing ? 'Actualizar servicio' : 'Agregar servicio'}
        </button>
      </form>

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando servicios…
        </p>
      ) : services.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay servicios registrados.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-start justify-between gap-4 rounded-sm border border-brand-turqSoft bg-white p-5 shadow-md"
            >
              <div>
                <h3 className="font-display text-base font-semibold text-brand-ink">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(service)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-brand-turq/40 px-3 py-2 text-sm text-brand-turqDeep hover:bg-brand-turq/10"
                  aria-label={`Editar servicio ${service.name}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(service)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  aria-label={`Eliminar servicio ${service.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Servicios