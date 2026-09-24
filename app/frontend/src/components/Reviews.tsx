import { Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { useApprovedReviews } from '../hooks/useApprovedReviews.ts'
import { container, itemCard } from '../lib/motion.ts'
import ReviewCard from './ReviewCard.tsx'
import SectionHeader from './SectionHeader.tsx'

const EMPTY_REVIEWS_MESSAGE = 'Próximamente nuestros primeros testimonios'

function Reviews() {
  const { reviews, error } = useApprovedReviews()

  return (
    <section
      id="resenas"
      className="bg-white/30 py-24"
      aria-labelledby="resenas-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="resenas-title"
          label="Reseñas"
          title="Lo que dicen nuestros clientes"
        />

        <p className="mb-8 text-slate-500">
          {error
            ? 'No se pudieron cargar las reseñas. Intenta de nuevo más tarde.'
            : null}
        </p>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
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

export default Reviews