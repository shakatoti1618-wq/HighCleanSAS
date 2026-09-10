import { useEffect, useState } from 'react'
import { Images } from 'lucide-react'
import { fetchGalleryImages, type GalleryImage } from '../lib/api.ts'

const TODO_TEXT = 'TODO: información pendiente de confirmar con High Clean SAS'

function Galeria() {
  const [images, setImages] = useState<GalleryImage[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchGalleryImages()
      .then((data) => {
        if (active) setImages(data)
      })
      .catch(() => {
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Galería</h1>
      <p className="mt-2 text-slate-400">
        {error
          ? 'No se pudieron cargar las imágenes. Intenta de nuevo más tarde.'
          : `Fotografías de nuestros trabajos. Las imágenes estarán disponibles próximamente: ${TODO_TEXT}`}
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images?.map((image) => (
          <figure
            key={image.id}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <img
              src={image.url}
              alt={image.alt ?? 'Fotografía del trabajo de High Clean SAS'}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <figcaption className="p-4 text-sm text-slate-400">
              {image.alt ?? TODO_TEXT}
            </figcaption>
          </figure>
        ))}
        {images !== null && images.length === 0 && (
          <div className="col-span-full">
            <Images
              className="mx-auto h-10 w-10 text-slate-500"
              aria-hidden="true"
            />
            <p className="mt-4 text-center text-slate-500">{TODO_TEXT}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Galeria