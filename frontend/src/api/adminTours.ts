import { apiFetch } from './client'
import type { PageResponse } from '../types/api'

export type DiemDenSummary = {
  id: number
  ten?: string
  hinhAnh?: string
  vungMien?: string
}

export type PhuongTienSummary = {
  id: number
  ten?: string
  loai?: string
}

export type DiemDonDto = {
  id: number
  ten?: string
  diaChi?: string
  thanhPho?: string
}

export type LichTrinhDto = {
  id?: number
  ngayThu: number
  tieuDe: string
  soBuaAn?: string
  hoatDongChinh?: string
  moTa?: string
  nghiDem?: string
  hinhAnh?: string
  noiDungLines?: string[]
}

export type NgayKhoiHanhDto = {
  id?: number
  ngayKhoiHanh: string
  ngayKetThuc?: string
  soChoToiDa?: number
  soChoDaDat?: number
  giaOverride?: number
  trangThai?: string
  availableSeats?: number
}

export type TourSummary = {
  id: number
  tieuDe?: string
  gia?: number
  hinhAnh?: string
  ngayKhoiHanh?: string
  noiBat?: boolean
  diemDen?: DiemDenSummary
  phuongTien?: PhuongTienSummary
}

export type TourResponse = {
  id: number
  tieuDe?: string
  moTa?: string
  gia?: number
  ngayKhoiHanh?: string
  ngayKetThuc?: string
  hinhAnh?: string
  highlight?: string
  noiBat?: boolean
  diemDen?: DiemDenSummary
  phuongTien?: { id?: number; ten?: string; loai?: string }
  diemDons?: DiemDonDto[]
  noiLuuTru?: { id?: number; ten?: string; loai?: string }
  lichTrinhs?: LichTrinhDto[]
  ngayKhoiHanhs?: NgayKhoiHanhDto[]
}

export type NoiLuuTruSummary = {
  id: number
  ten?: string
  loai?: string
}

export type TourFormOptions = {
  destinations: DiemDenSummary[]
  vehicles: PhuongTienSummary[]
  pickups: DiemDonDto[]
  accommodations?: NoiLuuTruSummary[]
}

export type CreateTourPayload = {
  tieuDe: string
  moTa?: string
  gia: number
  idDiemDen: number
  idPhuongTien?: number
  idDiemDonDefault?: number
  idNoiLuuTru?: number
  diemDonIds?: number[]
  hinhAnh?: string
  highlight?: string
  ngayKhoiHanh?: string | null
  ngayKetThuc?: string | null
  noiBat?: boolean
  lichTrinhs?: LichTrinhDto[]
}

export function listAdminTours(status: string, page = 0, size = 12) {
  return apiFetch<PageResponse<TourSummary>>(
    `/admin/tours?status=${status}&page=${page}&size=${size}`,
    {},
    true,
  )
}

export function getTourFormOptions() {
  return apiFetch<TourFormOptions>('/admin/tours/form-options', {}, true)
}

export function getAdminTour(id: number) {
  return apiFetch<TourResponse>(`/admin/tours/${id}`, {}, true)
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function uploadTourImage(file: File) {
  const token = localStorage.getItem('accessToken')
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${API_BASE}/admin/tours/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  })
  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    message?: string
    data?: { path?: string }
  } | null
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message ?? `Upload thất bại (${res.status})`)
  }
  const path = json?.data?.path
  if (!path) throw new Error('Không nhận được đường dẫn ảnh')
  return path
}

export function createAdminTour(body: CreateTourPayload) {
  return apiFetch<TourResponse>('/admin/tours', { method: 'POST', body: JSON.stringify(body) }, true)
}

export function updateAdminTour(id: number, body: Partial<CreateTourPayload>) {
  return apiFetch<TourResponse>(`/admin/tours/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true)
}

export function deleteAdminTour(id: number) {
  return apiFetch<void>(`/admin/tours/${id}`, { method: 'DELETE' }, true)
}

export function listTourSchedules(tourId: number) {
  return apiFetch<NgayKhoiHanhDto[]>(`/admin/tours/${tourId}/schedules`, {}, true)
}

export function createTourSchedule(tourId: number, body: Partial<NgayKhoiHanhDto>) {
  return apiFetch<NgayKhoiHanhDto>(
    `/admin/tours/${tourId}/schedules`,
    { method: 'POST', body: JSON.stringify(body) },
    true,
  )
}

export function updateTourSchedule(tourId: number, scheduleId: number, body: Partial<NgayKhoiHanhDto>) {
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
