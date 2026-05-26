import { apiFetch } from './client'

export interface FavoriteItem {
  id: number
  idNguoiDung: number
  idChuyenDi: number
}

export function listFavorites() {
  return apiFetch<FavoriteItem[]>('/favorites', {}, true)
}

export function addFavorite(tourId: number) {
  return apiFetch<FavoriteItem>(`/favorites/${tourId}`, { method: 'POST' }, true)
}

export function removeFavorite(tourId: number) {
  return apiFetch<void>(`/favorites/${tourId}`, { method: 'DELETE' }, true)
}
