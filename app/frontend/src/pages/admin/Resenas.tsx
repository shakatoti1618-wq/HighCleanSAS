import { useEffect, useState } from 'react'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import {
  deleteReview,
  fetchAdminReviews,
  updateReviewStatus,
  type AdminReview,
  type ReviewStatus,
} from '../../lib/admin.ts'

const statusLabels: Record<ReviewStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
}

const statusStyles: Record<ReviewStatus, string> = {
  PENDING: 'bg-brand-gold/15 text-brand-goldDeep',
  APPROVED: 'bg-brand-leaf/15 text-brand-leafDeep',
  REJECTED: 'bg-red-100 text-red-700',
}

function Resenas() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    void fetchAdminReviews()
      .then((data) => {
        if (active) setReviews(data)
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'No se pudieron cargar las reseñas',
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

  const setStatus = async (review: AdminReview, status: ReviewStatus) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      const updated = await updateReviewStatus(review.id, status)
      setReviews((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar la reseña',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (review: AdminReview) => {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteReview(review.id)
      setReviews((previous) => previous.filter((item) => item.id !== review.id))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar la reseña',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="resenas-title">
      <h1
        id="resenas-title"
        className="bg-gradient-to-r from-brand-leaf to-brand-turq bg-clip-text font-display text-2xl font-bold text-transparent"
      >
        Reseñas
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Aprueba o rechaza las reseñas. Solo las aprobadas se muestran en el
        sitio público.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando reseñas…
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay reseñas registradas.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-sm border border-brand-turqSoft bg-white p-5 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">
                    {review.author}
                    <span
                      className={`ml-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[review.status]}`}
                    >
                      {statusLabels[review.status]}
                    </span>
                  </p>
                  <p className="text-sm text-brand-goldDeep" aria-label={`${review.rating} de 5 estrellas`}>
                    {'★'.repeat(review.rating)}
                    {review.rating < 5 && '☆'.repeat(5 - review.rating)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {review.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => setStatus(review, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-brand-leaf px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-leafDeep"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Aprobar
                    </button>
                  )}
                  {review.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => setStatus(review, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Rechazar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    aria-label={`Eliminar reseña de ${review.author}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Resenas