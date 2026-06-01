import { apiFetch } from './client'
import type { PageResponse, TourDetail, TourSummary } from '../types/api'

export type NgayKhoiHanhDto = {
  id?: number
  ngayKhoiHanh?: string
  ngayKetThuc?: string
  soChoToiDa?: number
  soChoDaDat?: number
  giaOverride?: number
  trangThai?: string
  gioBayDi?: string
  gioDenDi?: string
  maChuyenBayDi?: string
  giaVeDi?: number
  gioBayVe?: string
  gioDenVe?: string
  maChuyenBayVe?: string
  giaVeVe?: number
}

export function listAdminTours(status: 'active' | 'completed', page = 0, size = 12) {
  return apiFetch<PageResponse<TourSummary>>(
    `/admin/tours?status=${status}&page=${page}&size=${size}`,
    {},
    true,
  )
}

export function getAdminTour(id: number) {
  return apiFetch<TourDetail>(`/admin/tours/${id}`, {}, true)
}

export function createAdminTour(body: Record<string, unknown>) {
  return apiFetch<TourDetail>('/admin/tours', { method: 'POST', body: JSON.stringify(body) }, true)
}

export function updateAdminTour(id: number, body: Record<string, unknown>) {
  return apiFetch<TourDetail>(`/admin/tours/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true)
}

export function deleteAdminTour(id: number) {
  return apiFetch<void>(`/admin/tours/${id}`, { method: 'DELETE' }, true)
}

export function listTourSchedules(tourId: number) {
  return apiFetch<NgayKhoiHanhDto[]>(`/admin/tours/${tourId}/schedules`, {}, true)
}

export function createTourSchedule(tourId: number, body: NgayKhoiHanhDto) {
  return apiFetch<NgayKhoiHanhDto>(
    `/admin/tours/${tourId}/schedules`,
    { method: 'POST', body: JSON.stringify(body) },
    true,
  )
}

export function updateTourSchedule(tourId: number, scheduleId: number, body: NgayKhoiHanhDto) {
  return apiFetch<NgayKhoiHanhDto>(
    `/admin/tours/${tourId}/schedules/${scheduleId}`,
    { method: 'PUT', body: JSON.stringify(body) },
    true,
  )
}

export function toggleTourSchedule(tourId: number, scheduleId: number) {
  return apiFetch<NgayKhoiHanhDto>(
    `/admin/tours/${tourId}/schedules/${scheduleId}/toggle`,
    { method: 'PUT' },
    true,
  )
}

export function deleteTourSchedule(tourId: number, scheduleId: number) {
  return apiFetch<void>(`/admin/tours/${tourId}/schedules/${scheduleId}`, { method: 'DELETE' }, true)
}
