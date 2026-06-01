import { apiFetch } from './client'
import type {
  BookingResponse,
  CheckInDetail,
  CheckInResult,
  CreateBookingRequest,
  PageResponse,
  PaymentInitResponse,
} from '../types/api'

export function createBooking(req: CreateBookingRequest) {
  return apiFetch<BookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(req),
  }, true)
}

export function myBookings(page = 0, size = 10) {
  return apiFetch<PageResponse<BookingResponse>>(
    `/bookings?page=${page}&size=${size}`,
    {},
    true,
  )
}

export function cancelBooking(id: number) {
  return apiFetch<void>(`/bookings/${id}/cancel`, { method: 'POST' }, true)
}

export function applyPromo(ma: string, subtotal: number) {
  return apiFetch<{ valid: boolean; message?: string; discount?: number; finalAmount?: number }>(
    '/bookings/promo/apply',
    { method: 'POST', body: JSON.stringify({ ma, subtotal }) },
    true,
  )
}

export function initVnPay(bookingId: number, amount: number) {
  return apiFetch<PaymentInitResponse>(
    '/payments/vnpay/init',
    {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, orderInfo: `Thanh toán đơn #${bookingId}` }),
    },
    true,
  )
}

export function getCheckInDetail(token: string) {
  return apiFetch<CheckInDetail>(`/check-in/${encodeURIComponent(token)}`)
}

export function confirmCheckIn(token: string) {
  return apiFetch<CheckInResult>(
    `/check-in/${encodeURIComponent(token)}`,
    { method: 'POST' },
    true,
  )
}

