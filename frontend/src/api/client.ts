import type { ApiResponse } from '../types/api'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number
  body?: ApiResponse<unknown>

  constructor(message: string, status: number, body?: ApiResponse<unknown>) {
    super(message)
    this.status = status
    this.body = body
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
    ...(auth ? authHeaders() : {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null

  if (!res.ok || body?.success === false) {
    throw new ApiError(
      body?.message ?? `HTTP ${res.status}`,
      res.status,
      body ?? undefined,
    )
  }

  return body as ApiResponse<T>
}
