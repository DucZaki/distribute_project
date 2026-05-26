import { apiFetch } from './client'

export interface UserProfile {
  id: number
  tenDangNhap: string
  email: string
  hoTen: string
  number?: string
  vaiTro: string
  anhDaiDien?: string
}

export function getMe() {
  return apiFetch<UserProfile>('/users/me', {}, true)
}

export function updateMe(payload: { hoTen?: string; number?: string; anhDaiDien?: string }) {
  return apiFetch<UserProfile>('/users/me', { method: 'PUT', body: JSON.stringify(payload) }, true)
}

export function changePassword(oldPassword: string, newPassword: string) {
  return apiFetch<void>(
    '/users/me/password',
    { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) },
    true,
  )
}
