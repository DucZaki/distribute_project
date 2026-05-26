import { apiFetch } from './client'
import type { PageResponse, ReviewItem } from '../types/api'

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
}

export function submitContact(payload: {
  hoTen: string
  email: string
  noiDung: string
  tieuDe?: string
}) {
  return apiFetch<unknown>('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTourReviews(tourId: number, page = 0) {
  return apiFetch<PageResponse<ReviewItem>>(`/reviews/tour/${tourId}?page=${page}&size=10`)
}

export function getReviewSummary(tourId: number) {
  return apiFetch<ReviewSummary>(`/reviews/tour/${tourId}/summary`)
}

export function createReview(idChuyenDi: number, diem: number, noiDung: string) {
  return apiFetch<ReviewItem>(
    '/reviews',
    { method: 'POST', body: JSON.stringify({ idChuyenDi, diem, noiDung }) },
    true,
  )
}
