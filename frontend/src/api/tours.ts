import { apiFetch } from './client'
import type { DiemDenSummary, PageResponse, TourDetail, TourSummary } from '../types/api'
import { parseNgayDi, priceRangeFromKhoangGia } from '../utils/searchFilters'

export function getFeaturedTours() {
  return apiFetch<TourSummary[]>('/tours/featured')
}

export function getFeaturedDestinations() {
  return apiFetch<DiemDenSummary[]>('/tours/destinations/featured')
}

export function searchTours(params: {
  keyword?: string
  page?: number
  size?: number
  sort?: string
  diemDen?: string
  ngayDi?: string
  khoangGia?: string
  thanhPho?: string
  quocGia?: string
}) {
  const q = new URLSearchParams()
  const keyword = params.keyword ?? params.diemDen ?? params.thanhPho ?? params.quocGia
  if (keyword) q.set('keyword', keyword)
  if (params.sort) q.set('sort', params.sort)
  const ngay = parseNgayDi(params.ngayDi)
  if (ngay) q.set('ngayTu', ngay)
  const { giaTu, giaDen } = priceRangeFromKhoangGia(params.khoangGia)
  if (giaTu != null) q.set('giaTu', String(giaTu))
  if (giaDen != null) q.set('giaDen', String(giaDen))
  q.set('page', String(params.page ?? 0))
  q.set('size', String(params.size ?? 12))
  return apiFetch<PageResponse<TourSummary>>(`/tours?${q}`)
}

export function getNearbyTours(params: {
  lat?: number
  lng?: number
  city?: string
  radiusKm?: number
  page?: number
  size?: number
}) {
  const q = new URLSearchParams()
  if (params.lat != null) q.set('lat', String(params.lat))
  if (params.lng != null) q.set('lng', String(params.lng))
  if (params.city) q.set('city', params.city)
  if (params.radiusKm != null) q.set('radiusKm', String(params.radiusKm))
  q.set('page', String(params.page ?? 0))
  q.set('size', String(params.size ?? 6))
  return apiFetch<PageResponse<TourSummary>>(`/tours/nearby?${q}`)
}

export function getTour(id: number) {
  return apiFetch<TourDetail>(`/tours/${id}`)
}

export type FlightQuote = {
  available: boolean
  message?: string
  unitPrice?: number
  giaTour?: number
  tongGiaVe?: number
  giaVeDi?: number
  giaVeVe?: number
  diemDonTen?: string
  diemDenTen?: string
  maChuyenBayDi?: string
  gioBayDi?: string
  ngayDi?: string
  ngayVe?: string
}

export function fetchFlightQuote(tourId: number, nkhId: number, diemDonId: number, refresh = false) {
  const q = new URLSearchParams({
    nkhId: String(nkhId),
    diemDonId: String(diemDonId),
    refresh: String(refresh),
  })
  return apiFetch<FlightQuote>(`/tours/${tourId}/flight-quote?${q}`)
}
