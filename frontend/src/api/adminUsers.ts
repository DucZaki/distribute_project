import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type AdminUser = {
  id: number
  tenDangNhap: string
  email: string
  hoTen?: string
  number?: string
  vaiTro: string
  provider?: string
  anhDaiDien?: string
  enabled?: boolean
  ngayTao?: string
}

export function listAdminUsers(page = 0, size = 20) {
  return apiFetch<PageResponse<AdminUser>>(`/admin/users?page=${page}&size=${size}`, {}, true)
}

export function getAdminUser(id: number) {
  return apiFetch<AdminUser>(`/admin/users/${id}`, {}, true)
}

export function createAdminUser(body: {
  tenDangNhap: string
  email: string
  password: string
  hoTen?: string
  number?: string
  vaiTro?: string
  enabled?: boolean
}) {
  return apiFetch<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(body) }, true)
}

export function updateAdminUser(
  id: number,
  body: { vaiTro?: string; enabled?: boolean; hoTen?: string; number?: string },
) {
  return apiFetch<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true)
}

export function deleteAdminUser(id: number) {
  return apiFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }, true)
}
