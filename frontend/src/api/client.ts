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

let refreshInFlight: Promise<string | null> | null = null

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('authUser')
  const path = window.location.pathname + window.location.search
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = `/login?session=expired&from=${encodeURIComponent(path)}`
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as ApiResponse<{
          accessToken?: string
          refreshToken?: string
        }> | null
        if (!res.ok || !body?.data?.accessToken) return null
        localStorage.setItem('accessToken', body.data.accessToken)
        if (body.data.refreshToken) {
          localStorage.setItem('refreshToken', body.data.refreshToken)
        }
        return body.data.accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

async function parseResponse<T>(res: Response): Promise<{
  body: ApiResponse<T> | { message?: string } | null
  ok: boolean
}> {
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | { message?: string } | null
  const ok = res.ok && !(body && 'success' in body && body.success === false)
  return { body, ok }
}

function throwApiError<T>(res: Response, body: ApiResponse<T> | { message?: string } | null): never {
  const apiBody = body && 'success' in body ? (body as ApiResponse<T>) : undefined
  const springMsg = body && 'message' in body ? String((body as { message?: string }).message) : undefined
  throw new ApiError(apiBody?.message ?? springMsg ?? `HTTP ${res.status}`, res.status, apiBody)
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
  retried = false,
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
    ...(auth ? authHeaders() : {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  let { body, ok } = await parseResponse<T>(res)

  if (auth && res.status === 401 && !retried && !path.startsWith('/auth/')) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiFetch<T>(path, init, auth, true)
    }
    clearSessionAndRedirect()
    throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401)
  }

  if (!ok) {
    throwApiError(res, body)
  }

  return body as ApiResponse<T>
}
