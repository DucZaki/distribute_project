import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type Review = {
  id: number
  idChuyenDi: number
  idNguoiDung: number
  diem: number
  noiDung?: string
  createdAt?: string
}

export function listReviews(page = 0, size = 50, tourId?: number) {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (tourId) q.set('tourId', String(tourId))
  return apiFetch<PageResponse<Review>>(`/admin/reviews?${q}`, {}, true)
}

export function deleteReview(id: number) {
  return apiFetch<void>(`/admin/reviews/${id}`, { method: 'DELETE' }, true)
}
