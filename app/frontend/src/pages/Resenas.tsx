import { Quote } from 'lucide-react'
import { motion } from 'motion/react'
import ReviewCard from '../components/ReviewCard.tsx'
import Seo from '../components/Seo.tsx'
import { useApprovedReviews } from '../hooks/useApprovedReviews.ts'
import { container, itemCard } from '../lib/motion.ts'
import { reviewsJson } from '../lib/seo.ts'

const EMPTY_REVIEWS_MESSAGE = 'Próximamente nuestros primeros testimonios'

function Resenas() {
  const { reviews, error } = useApprovedReviews()
  const jsonLd = reviews ? reviewsJson('High Clean SAS', reviews) : null

  return (
    <section
      className="relative bg-white/50 py-24"
      aria-labelledby="resenas-title"
    >
      <Seo
        title="Reseñas y opiniones — High Clean SAS"
        description="Reseñas de clientes sobre los servicios de aseo y limpieza de High Clean SAS."
        canonicalPath="/resenas"
        jsonLd={jsonLd ? [jsonLd] : []}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-turqDeep" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-turqDeep">Reseñas</p>
          </div>
          <h1
            id="resenas-title"
            className="text-balance bg-linear-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent md:text-4xl"
          >
            Reseñas
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Lo que dicen nuestros clientes sobre High Clean SAS.
          </p>
        </div>

        <p className="mb-8 text-slate-500">
          {error
            ? 'No se pudieron cargar las reseñas. Intenta de nuevo más tarde.'
            : null}
        </p>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {reviews?.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {reviews !== null && reviews.length === 0 && (
            <motion.div
              variants={itemCard}
              className="col-span-full flex flex-col items-center rounded-sm border border-dashed border-brand-turq/30 bg-white/60 p-12 text-center"
            >
              <Quote
                className="h-10 w-10 text-brand-turq/50"
                aria-hidden="true"
              />
              <p className="mt-4 text-slate-600">{EMPTY_REVIEWS_MESSAGE}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Resenas