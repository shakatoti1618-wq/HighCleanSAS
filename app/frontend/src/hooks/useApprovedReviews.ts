import { useEffect, useState } from 'react'
import { fetchApprovedReviews, type Review } from '../lib/api.ts'

export function useApprovedReviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchApprovedReviews()
      .then((data) => {
        if (active) setReviews(data)
      })
      .catch(() => {
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [])

  return { reviews, error }
}