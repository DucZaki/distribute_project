import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type TourReviewSummary = {
  tourId: number
  tieuDe?: string
  hinhAnh?: string
  avgRating: number
  totalReviews: number
  positivePercentage: number
}

export type AdminReview = {
  id: number
  idChuyenDi: number
  idNguoiDung: number
  hoTen?: string
  tenDangNhap?: string
  diem: number
  noiDung?: string
  createdAt?: string
  tourTitle?: string
}

export type ReviewListParams = {
  tourId?: number
  diem?: number
  hoTen?: string
  sort?: string
  page?: number
  size?: number
}

export function listToursWithReviews(sort?: string) {
  const q = sort ? `?sort=${encodeURIComponent(sort)}` : ''
  return apiFetch<TourReviewSummary[]>(`/admin/reviews/tours${q}`, {}, true)
}

export function listReviews(params: ReviewListParams = {}) {
  const q = new URLSearchParams()
  q.set('page', String(params.page ?? 0))
  q.set('size', String(params.size ?? 10))
  if (params.tourId != null) q.set('tourId', String(params.tourId))
  if (params.diem != null) q.set('diem', String(params.diem))
  if (params.hoTen) q.set('hoTen', params.hoTen)
  if (params.sort) q.set('sort', params.sort)
  return apiFetch<PageResponse<AdminReview>>(`/admin/reviews?${q}`, {}, true)
}

export function deleteReview(id: number) {
  return apiFetch<void>(`/admin/reviews/${id}`, { method: 'DELETE' }, true)
}
