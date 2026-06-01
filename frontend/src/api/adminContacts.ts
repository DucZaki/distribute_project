import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type Contact = {
  id: number
  hoTen: string
  email: string
  soDienThoai?: string
  tieuDe?: string
  noiDung: string
  trangThai?: string
  createdAt?: string
}

export function listContacts(trangThai?: string, page = 0, size = 20) {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (trangThai) q.set('trangThai', trangThai)
  return apiFetch<PageResponse<Contact>>(`/admin/contacts?${q}`, {}, true)
}

export function getContact(id: number) {
  return apiFetch<Contact>(`/admin/contacts/${id}`, {}, true)
}

export function updateContactStatus(id: number, trangThai: string) {
  return apiFetch<Contact>(
    `/admin/contacts/${id}/status?trangThai=${encodeURIComponent(trangThai)}`,
    { method: 'PUT' },
    true,
  )
}

export function deleteContact(id: number) {
  return apiFetch<void>(`/admin/contacts/${id}`, { method: 'DELETE' }, true)
}
