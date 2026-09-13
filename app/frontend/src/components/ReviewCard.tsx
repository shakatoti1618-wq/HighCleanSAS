import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import type { Review } from '../lib/api.ts'
import { item } from '../lib/motion.ts'

interface ReviewCardProps {
  review: Review
}

const STAR_RANGE = [1, 2, 3, 4, 5] as const

function ReviewCard({ review }: ReviewCardProps) {
  const initial =
    review.author.startsWith('[') || review.author.startsWith('TODO')
      ? '—'
      : review.author.charAt(0).toUpperCase()

  return (
    <motion.figure
      variants={item}
      className="rounded-sm border border-brand-turqSoft bg-white p-8 shadow-md"
    >
      <div
        className="mb-4 flex items-center gap-1 text-brand-gold"
        role="img"
        aria-label={`Calificación: ${review.rating} de 5 estrellas`}
      >
        {STAR_RANGE.map((star) => (
          <Star
            key={star}
            className="h-5 w-5"
            fill={star <= review.rating ? 'currentColor' : 'none'}
            stroke={star <= review.rating ? 'none' : 'currentColor'}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote className="mb-5 text-sm leading-relaxed text-slate-600">
        {review.content}
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-turq/10 font-semibold text-brand-turqDeep"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="text-sm font-semibold text-brand-ink">
          {review.author}
        </span>
      </figcaption>
    </motion.figure>
  )
}

export default ReviewCard