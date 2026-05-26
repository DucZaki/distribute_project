import { apiFetch } from './client'
import type { TokenResponse } from '../types/api'

export function login(email: string, password: string) {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(payload: {
  email: string
  password: string
  tenDangNhap: string
  hoTen: string
  number?: string
}) {
  return apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
