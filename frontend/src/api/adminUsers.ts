import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type AdminUser = {
  id: number
  tenDangNhap?: string
  email?: string
  hoTen?: string
  number?: string
  vaiTro?: string
  provider?: string
  enabled?: boolean
  ngayTao?: string
}

export type UserBookingStats = {
  paidBookings: number
  totalSpending: number
}

export type UserDetailStats = {
  totalBookings: number
  paidBookings: number
  totalSpending: number
  lastBooking?: {
    bookingId?: number
    tourId?: number
    tourTitle?: string
    tongGia?: number
    ngayDat?: string
    trangThai?: string
  } | null
}

export type UserBookingRow = {
  id: number
  idChuyenDi?: number
  tieuDeTour?: string
  soLuong?: number
  tongGia?: number
  ngayDat?: string
  trangThai?: string
  maCheckIn?: string
}

export function listAdminUsers(page = 0, size = 10, q?: string) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (q?.trim()) params.set('q', q.trim())
  return apiFetch<PageResponse<AdminUser>>(`/admin/users?${params}`, {}, true)
}

export function getAdminUser(id: number) {
  return apiFetch<AdminUser>(`/admin/users/${id}`, {}, true)
}

export function createAdminUser(body: Record<string, unknown>) {
  return apiFetch<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(body) }, true)
}

export function updateAdminUser(id: number, body: Record<string, unknown>) {
  return apiFetch<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true)
}

export function deleteAdminUser(id: number) {
  return apiFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }, true)
}

export function getUserStatsBatch(ids: number[]) {
  if (!ids.length) return Promise.resolve({ data: {} as Record<number, UserBookingStats> })
  const q = ids.join(',')
  return apiFetch<Record<number, UserBookingStats>>(`/admin/bookings/user-stats?ids=${q}`, {}, true)
}

export function getUserDetailStats(userId: number) {
  return apiFetch<UserDetailStats>(`/admin/bookings/by-user/${userId}/stats`, {}, true)
}

export function getUserBookings(userId: number, page = 0, size = 5) {
  return apiFetch<PageResponse<UserBookingRow>>(
    `/admin/bookings/by-user/${userId}?page=${page}&size=${size}`,
    {},
    true,
  )
}

export function getUserMonthlySpending(userId: number, year: number) {
  return apiFetch<{ labels: string[]; data: number[]; year: number }>(
    `/admin/bookings/by-user/${userId}/spending?year=${year}`,
    {},
    true,
  )
}
