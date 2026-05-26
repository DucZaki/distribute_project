const FALLBACK =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'

export function formatVnd(value?: number) {
  if (value == null) return '—'
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
}

export function imageUrl(path?: string) {
  if (!path) return FALLBACK
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  return FALLBACK
}

export function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    CONFIRMED: 'Đã xác nhận',
    PAID: 'Đã thanh toán',
    CANCELLED: 'Đã huỷ',
    FAILED: 'Thất bại',
  }
  return map[s] ?? s
}

export function bookingTabFilter(
  tab: 'all' | 'pending' | 'paid' | 'failed',
  trangThai: string,
) {
  if (tab === 'all') return true
  if (tab === 'pending') return trangThai === 'PENDING'
  if (tab === 'paid') return trangThai === 'CONFIRMED' || trangThai === 'PAID'
  return trangThai === 'CANCELLED' || trangThai === 'FAILED'
}
