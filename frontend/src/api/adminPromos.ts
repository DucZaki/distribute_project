import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type Promo = {
  id: number
  ma: string
  moTa?: string
  loai: string
  giaTri: number
  ngayBatDau?: string
  ngayKetThuc?: string
  soLanDungToiDa?: number
  soLanDaDung?: number
  active?: boolean
}

export function listPromos(page = 0, size = 20) {
  return apiFetch<PageResponse<Promo>>(`/admin/promos?page=${page}&size=${size}`, {}, true)
}

export function createPromo(body: Partial<Promo>) {
  return apiFetch<Promo>('/admin/promos', { method: 'POST', body: JSON.stringify(body) }, true)
}

export function updatePromo(id: number, body: Partial<Promo>) {
  return apiFetch<Promo>(`/admin/promos/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true)
}

export function deletePromo(id: number) {
  return apiFetch<void>(`/admin/promos/${id}`, { method: 'DELETE' }, true)
}
