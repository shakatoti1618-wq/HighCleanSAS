import { findApprovedReviews } from '../repositories/review.repository.js'

export async function getApprovedReviews() {
  return findApprovedReviews()
}