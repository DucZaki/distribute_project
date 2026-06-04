import type { UserSummary } from '../types/api'

/** ADMIN → dashboard; USER → trang chủ (trừ khi `from` là đường dẫn user hợp lệ). */
export function resolvePostLoginPath(user: UserSummary, from?: string): string {
  const role = (user.vaiTro ?? '').toUpperCase()
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
  if (isAdmin) return '/admin'

  const safeFrom = from && from !== '/login' && from !== '/register' && !from.startsWith('/admin')
    ? from
    : '/'
  return safeFrom
}
