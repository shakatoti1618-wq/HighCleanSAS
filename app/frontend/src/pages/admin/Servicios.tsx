import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ListPlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import type { Service } from '../../lib/api.ts'
import {
  createService,
  deleteService,
  fetchAdminServices,
  replaceServiceOptions,
  updateService,
} from '../../lib/admin.ts'
import { formatCOP } from '../../lib/formatPrices.ts'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

interface DraftOption {
  label: string
  price: string
  note: string
  group: string
}

interface OptionsEditorProps {
  service: Service
  onSaved: (updated: Service) => void
  onCancel: () => void
}

function OptionsEditor({ service, onSaved, onCancel }: OptionsEditorProps) {
  const [rows, setRows] = useState<DraftOption[]>(
    service.options.map((option) => ({
      label: option.label,
      price: String(option.price),
      note: option.note ?? '',
      group: option.group ?? '',
    })),
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  )

  const updateRow = (index: number, patch: Partial<DraftOption>) => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    )
  }

  const moveRow = (index: number, direction: -1 | 1) => {
    setRows((previous) => {
      const target = index + direction
      if (target < 0 || target >= previous.length) return previous
      const next = [...previous]
      const current = next[index] as DraftOption
      const targetRow = next[target] as DraftOption
      next[index] = targetRow
      next[target] = current
      return next
    })
  }

  const handleSave = async () => {
    if (busy) return

    const options = rows.map((row, index) => ({
      label: row.label.trim(),
      price: Number(row.price),
      note: row.note.trim() === '' ? null : row.note.trim(),
      group: row.group.trim() === '' ? null : row.group.trim(),
      sortOrder: index + 1,
    }))

    if (options.length === 0) {
      setMessage({ ok: false, text: 'Agrega al menos una modalidad.' })
      return
    }

    const invalid = options.find(
      (option) =>
        option.label === '' ||
        option.price < 0 ||
        !Number.isInteger(option.price),
    )

    if (invalid) {
      setMessage({
        ok: false,
        text: 'Cada modalidad necesita un nombre y un precio entero válido.',
      })
      return
    }

    setBusy(true)
    setMessage(null)

    try {
      const updated = await replaceServiceOptions(service.id, options)
      onSaved(updated)
    } catch (saveError) {
      setMessage({
        ok: false,
        text:
          saveError instanceof Error
            ? saveError.message
            : 'No se pudieron guardar las modalidades',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-brand-turqSoft bg-white/70 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="font-display text-base font-semibold text-brand-ink">
          Modalidades y precios — {service.name}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cerrar
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mb-4 rounded-sm border border-dashed border-brand-turq/40 bg-white px-4 py-3 text-sm text-slate-500">
          Este servicio aún no tiene modalidades. Agrega la primera.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-sm border border-slate-200 bg-white p-4 md:grid-cols-12"
            >
              <label className="block md:col-span-4">
                <span className="mb-1 block text-xs font-medium text-brand-ink">
                  Nombre
                </span>
                <input
                  type="text"
                  value={row.label}
                  onChange={(event) => updateRow(index, { label: event.target.value })}
                  maxLength={100}
                  placeholder="Tiempo Completo (7h)"
                  className={inputClass}
                />
              </label>
              <label className="block md:col-span-3">
                <span className="mb-1 block text-xs font-medium text-brand-ink">
                  Precio (COP)
                </span>
                <input
                  type="number"
                  value={row.price}
                  onChange={(event) => updateRow(index, { price: event.target.value })}
                  min={0}
                  step={1}
                  placeholder="3350000"
                  className={inputClass}
                />
                {row.price !== '' && Number(row.price) >= 0 ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    {formatCOP(Number(row.price))}
                  </span>
                ) : null}
              </label>
              <label className="block md:col-span-3">
                <span className="mb-1 block text-xs font-medium text-brand-ink">
                  Grupo (opcional)
                </span>
                <input
                  type="text"
                  value={row.group}
                  onChange={(event) => updateRow(index, { group: event.target.value })}
                  maxLength={80}
                  placeholder="Generales / Todero"
                  className={inputClass}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-medium text-brand-ink">
                  Orden
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveRow(index, -1)}
                    disabled={index === 0}
                    className="rounded-sm border border-slate-200 px-2 py-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label={`Mover ${row.label || 'modalidad'} hacia arriba`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <span className="flex-1 text-center text-sm text-slate-500">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveRow(index, 1)}
                    disabled={index === rows.length - 1}
                    className="rounded-sm border border-slate-200 px-2 py-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label={`Mover ${row.label || 'modalidad'} hacia abajo`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </label>
              <label className="block md:col-span-11">
                <span className="mb-1 block text-xs font-medium text-brand-ink">
                  Nota (opcional)
                </span>
                <input
                  type="text"
                  value={row.note}
                  onChange={(event) => updateRow(index, { note: event.target.value })}
                  maxLength={300}
                  placeholder="Incluye planchado"
                  className={inputClass}
                />
              </label>
              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    setRows((previous) =>
                      previous.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-sm border border-red-200 px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                  aria-label={`Eliminar modalidad ${row.label || index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message ? (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={`mt-4 flex items-center gap-2 rounded-sm border px-4 py-3 text-sm ${
            message.ok
              ? 'border-brand-leaf/40 bg-brand-leaf/10 text-brand-leafDeep'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.ok ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : null}
          {message.text}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setRows((previous) => [
              ...previous,
              { label: '', price: '', note: '', group: '' },
            ])
          }
          className="inline-flex items-center gap-2 rounded-sm border border-brand-turq/40 px-4 py-2.5 text-sm font-semibold text-brand-turqDeep hover:bg-brand-turq/10"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar modalidad
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-turq px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Guardar modalidades
        </button>
      </div>
    </div>
  )
}

function Servicios() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [optionsEditorId, setOptionsEditorId] = useState<string | null>(null)
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
    setOptionsEditorId(null)
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
      if (optionsEditorId === service.id) setOptionsEditorId(null)
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

  const toggleOptionsEditor = (service: Service) => {
    setEditing(null)
    setSaved(false)
    setOptionsEditorId((current) => (current === service.id ? null : service.id))
  }

  const handleOptionsSaved = (updated: Service) => {
    setServices((previous) =>
      previous.map((service) => (service.id === updated.id ? updated : service)),
    )
    setOptionsEditorId(null)
    setSaved(true)
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
        Crea, edita y elimina los servicios que se muestran en tu sitio, y
        administra sus modalidades y precios.
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
              className="rounded-sm border border-brand-turqSoft bg-white p-5 shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-ink">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {service.options.length === 1
                      ? '1 modalidad'
                      : `${service.options.length} modalidades`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleOptionsEditor(service)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-brand-turq/40 px-3 py-2 text-sm text-brand-turqDeep hover:bg-brand-turq/10"
                    aria-label={`Editar modalidades de ${service.name}`}
                  >
                    <ListPlus className="h-4 w-4" aria-hidden="true" />
                    Modalidades
                  </button>
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
              </div>
              {optionsEditorId === service.id ? (
                <OptionsEditor
                  service={service}
                  onSaved={handleOptionsSaved}
                  onCancel={() => setOptionsEditorId(null)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Servicios