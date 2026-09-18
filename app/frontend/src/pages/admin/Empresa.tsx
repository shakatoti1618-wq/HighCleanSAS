import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { fetchCompany, type Company, type CompanyValue } from '../../lib/api.ts'
import { resetCompanyCache } from '../../hooks/useCompany.ts'
import { updateCompanyData } from '../../lib/admin.ts'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

function normalizeValues(values: CompanyValue[]): CompanyValue[] {
  return values.filter((value) => value.name.trim() && value.description.trim())
}

function Empresa() {
  const [form, setForm] = useState<Company | null>(null)
  const [values, setValues] = useState<CompanyValue[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void fetchCompany()
      .then((company) => {
        if (!active) return
        setForm(company)
        setValues((company.values ?? []).slice(0, 20))
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar los datos de la empresa',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleField = (key: keyof Company, value: string) => {
    setForm((previous) => (previous ? { ...previous, [key]: value } : previous))
    setSaved(false)
  }

  const handleCities = (value: string) => {
    setForm((previous) =>
      previous
        ? {
            ...previous,
            serviceCities: value
              .split(',')
              .map((city) => city.trim())
              .filter(Boolean),
          }
        : previous,
    )
    setSaved(false)
  }

  const handleValue = (
    index: number,
    key: keyof CompanyValue,
    value: string,
  ) => {
    setValues((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    )
    setSaved(false)
  }

  const addValue = () => {
    setValues((previous) => [...previous, { name: '', description: '' }])
  }

  const removeValue = (index: number) => {
    setValues((previous) => previous.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (saving || !form) return

    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      await updateCompanyData({
        description: form.description?.trim() || undefined,
        mission: form.mission?.trim() || undefined,
        vision: form.vision?.trim() || undefined,
        qualityPolicy: form.qualityPolicy?.trim() || undefined,
        values: normalizeValues(values).map((value) => ({
          name: value.name.trim(),
          description: value.description.trim(),
        })),
        phone: form.phone?.trim() || undefined,
        nit: form.nit?.trim() || undefined,
        whatsappNumber: form.whatsappNumber?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        schedules: form.schedules?.trim() || undefined,
        serviceCities:
          form.serviceCities && form.serviceCities.length > 0
            ? form.serviceCities
            : undefined,
      })
      resetCompanyCache()
      setSaved(true)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudieron guardar los cambios',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando información de la empresa…
      </p>
    )
  }

  return (
    <section aria-labelledby="empresa-title">
      <h1
        id="empresa-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Empresa
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Edita la descripción, misión, visión, política de calidad, valores y
        datos de contacto que se muestran en el sitio.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-5 rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            Información corporativa
          </h2>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-ink">
              Descripción
            </span>
            <textarea
              name="description"
              value={form?.description ?? ''}
              onChange={(event) => handleField('description', event.target.value)}
              rows={4}
              maxLength={5000}
              className={`${inputClass} resize-none`}
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Misión
              </span>
              <textarea
                name="mission"
                value={form?.mission ?? ''}
                onChange={(event) => handleField('mission', event.target.value)}
                rows={4}
                maxLength={5000}
                className={`${inputClass} resize-none`}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Visión
              </span>
              <textarea
                name="vision"
                value={form?.vision ?? ''}
                onChange={(event) => handleField('vision', event.target.value)}
                rows={4}
                maxLength={5000}
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-ink">
              Política de calidad
            </span>
            <textarea
              name="qualityPolicy"
              value={form?.qualityPolicy ?? ''}
              onChange={(event) =>
                handleField('qualityPolicy', event.target.value)
              }
              rows={4}
              maxLength={5000}
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>

        <div className="rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-brand-ink">
              Valores
            </h2>
            <button
              type="button"
              onClick={addValue}
              className="inline-flex items-center gap-1.5 rounded-sm bg-brand-turq px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Agregar valor
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Hasta 20 valores. Cada uno muestra su nombre y descripción en la
            página de Nosotros.
          </p>

          <div className="mt-4 space-y-4">
            {values.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay valores registrados. Agrega el primero.
              </p>
            )}
            {values.map((value, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-sm border border-slate-200 p-4 sm:grid-cols-[220px_1fr_auto]"
              >
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Nombre
                  </span>
                  <input
                    type="text"
                    value={value.name}
                    onChange={(event) =>
                      handleValue(index, 'name', event.target.value)
                    }
                    maxLength={80}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Descripción
                  </span>
                  <input
                    type="text"
                    value={value.description}
                    onChange={(event) =>
                      handleValue(index, 'description', event.target.value)
                    }
                    maxLength={400}
                    className={inputClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="self-end rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-red-600 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label={`Eliminar valor ${value.name || index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            Datos de contacto
          </h2>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                NIT
              </span>
              <input
                type="text"
                name="nit"
                value={form?.nit ?? ''}
                onChange={(event) => handleField('nit', event.target.value)}
                placeholder="901330960-1"
                maxLength={20}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Teléfono
              </span>
              <input
                type="text"
                name="phone"
                value={form?.phone ?? ''}
                onChange={(event) => handleField('phone', event.target.value)}
                maxLength={30}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Número de WhatsApp
              </span>
              <input
                type="text"
                name="whatsappNumber"
                value={form?.whatsappNumber ?? ''}
                onChange={(event) =>
                  handleField('whatsappNumber', event.target.value)
                }
                maxLength={30}
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
                value={form?.email ?? ''}
                onChange={(event) => handleField('email', event.target.value)}
                maxLength={254}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Dirección
              </span>
              <input
                type="text"
                name="address"
                value={form?.address ?? ''}
                onChange={(event) => handleField('address', event.target.value)}
                maxLength={300}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Ciudades de cobertura
              </span>
              <input
                type="text"
                name="serviceCities"
                value={form?.serviceCities?.join(', ') ?? ''}
                onChange={(event) => handleCities(event.target.value)}
                placeholder="Bogotá, Villavicencio, Medellín"
                maxLength={400}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Separa las ciudades con coma. Se muestran en la página de
                contacto y en el JSON-LD de SEO.
              </span>
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">
                Horarios
              </span>
              <input
                type="text"
                name="schedules"
                value={form?.schedules ?? ''}
                onChange={(event) =>
                  handleField('schedules', event.target.value)
                }
                maxLength={1000}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {saved && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-sm border border-brand-leaf/40 bg-brand-leaf/10 px-4 py-3 text-sm font-medium text-brand-leafDeep"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Cambios guardados correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-turq px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-brand-turqDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turq focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Guardar cambios
        </button>
      </form>
    </section>
  )
}

export default Empresa