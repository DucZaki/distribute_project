import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type AdminBooking = {
  id: number
  idChuyenDi?: number
  idNguoiDung?: number
  trangThai?: string
  tongGia?: number
  tongTien?: number
  soLuong?: number
  ngayDat?: string
  createdAt?: string
  hoTen?: string
  email?: string
  tieuDeTour?: string
}

export function listAdminBookings(trangThai?: string, page = 0, size = 20) {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (trangThai) q.set('trangThai', trangThai)
  return apiFetch<PageResponse<AdminBooking>>(`/admin/bookings?${q}`, {}, true)
}

export function getAdminBooking(id: number) {
  return apiFetch<AdminBooking>(`/admin/bookings/${id}`, {}, true)
}

export function cancelAdminBooking(id: number, reason?: string) {
  const q = reason ? `?reason=${encodeURIComponent(reason)}` : ''
  return apiFetch<void>(`/admin/bookings/${id}/cancel${q}`, { method: 'POST' }, true)
}
