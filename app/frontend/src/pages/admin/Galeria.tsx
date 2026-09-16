import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { GalleryImage } from '../../lib/api.ts'
import {
  createGalleryImage,
  deleteGalleryImage,
  fetchAdminGallery,
} from '../../lib/admin.ts'

const inputClass =
  'w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-turq'

function Galeria() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    void fetchAdminGallery()
      .then((data) => {
        if (active) setImages(data)
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar las imágenes',
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (busy) return

    setBusy(true)
    setError(null)

    try {
      const created = await createGalleryImage(url, alt)
      setImages((previous) => [...previous, created])
      setUrl('')
      setAlt('')
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'No se pudo agregar la imagen',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteGalleryImage(image.id)
      setImages((previous) => previous.filter((item) => item.id !== image.id))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar la imagen',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="galeria-title">
      <h1
        id="galeria-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Galería
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Agrega o quita imágenes mediante su URL pública. La carga de archivos se
        habilita en una fase posterior.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-3 rounded-sm border border-brand-turqSoft bg-white p-6 shadow-md"
      >
        <h2 className="font-display text-lg font-semibold text-brand-ink">
          Agregar imagen
        </h2>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-ink">
            URL de la imagen
          </span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            maxLength={2000}
            className={inputClass}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-ink">
            Texto alternativo
          </span>
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            maxLength={300}
            className={inputClass}
            placeholder="Describe la imagen para accesibilidad y SEO"
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
          Agregar imagen
        </button>
      </form>

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando galería…
        </p>
      ) : images.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay imágenes en la galería.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="group overflow-hidden rounded-sm border border-brand-turqSoft bg-white shadow-md"
            >
              <img
                src={image.url}
                alt={image.alt ?? ''}
                loading="lazy"
                className="h-44 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-sm text-slate-600">
                  {image.alt ?? 'Sin descripción'}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  aria-label={`Eliminar imagen ${image.alt ?? ''}`}
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

export default Galeria