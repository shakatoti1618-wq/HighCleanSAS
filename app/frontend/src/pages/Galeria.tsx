import { useEffect, useState } from 'react'
import { Images } from 'lucide-react'
import { motion } from 'motion/react'
import Seo from '../components/Seo.tsx'
import { container, item } from '../lib/motion.ts'
import { fetchGalleryImages, type GalleryImage } from '../lib/api.ts'

function VideoItem({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 bg-slate-900 p-6 text-center">
        <p className="text-sm leading-relaxed text-white">
          No se pudo reproducir el video dentro de la página.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-sm bg-brand-turq px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-turqDeep"
        >
          Ver video
        </a>
      </div>
    )
  }

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className="aspect-[3/4] w-full bg-slate-900 object-cover"
      onError={() => setFailed(true)}
    />
  )
}

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
    <section
      className="relative bg-white/50 py-24"
      aria-labelledby="galeria-title"
    >
      <Seo
        title="Galería — High Clean SAS"
        description="Fotografías de los trabajos de limpieza profesional de High Clean SAS."
        canonicalPath="/galeria"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-turqDeep" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-turqDeep">Galería</p>
          </div>
          <h1
            id="galeria-title"
            className="text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
          >
            Galería
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Fotografías de nuestros trabajos de limpieza profesional en hogares,
            conjuntos, oficinas y más.
          </p>
        </div>

        <p className="mb-8 text-slate-500">
          {error
            ? 'No se pudieron cargar las imágenes. Intenta de nuevo más tarde.'
            : null}
        </p>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {images?.map((image) => (
            <motion.figure
              key={image.id}
              variants={item}
              className="group relative overflow-hidden rounded-sm bg-white shadow-md"
            >
              {image.type === 'VIDEO' ? (
                <>
                  <VideoItem url={image.url} />
                  <figcaption className="bg-brand-ink/90 p-3 text-center">
                    <p className="text-sm font-semibold text-white">
                      Video de High Clean SAS
                    </p>
                  </figcaption>
                </>
              ) : (
                <>
                  <img
                    src={image.url}
                    alt={image.alt ?? 'Fotografía del trabajo de High Clean SAS'}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                  <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-brand-ink/90 via-brand-ink/25 to-transparent p-6">
                    <p className="font-display text-lg font-semibold leading-snug text-white">
                      Trabajo de High Clean SAS
                    </p>
                  </figcaption>
                </>
              )}
            </motion.figure>
          ))}

          {images !== null && images.length === 0 && (
            <motion.div
              variants={item}
              className="col-span-full flex flex-col items-center rounded-sm border border-dashed border-brand-turq/30 bg-white/60 p-12 text-center"
            >
              <Images
                className="h-10 w-10 text-brand-turq/50"
                aria-hidden="true"
              />
              <p className="mt-4 text-slate-600">
                Aún no hay imágenes publicadas.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Galeria