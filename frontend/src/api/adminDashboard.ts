import { apiFetch } from './client'

export type DashboardKpis = {
  totalBookings: number
  successBookings: number
  failedBookings: number
  pendingBookings?: number
  totalRevenue: number
  revenueThisMonth?: number
  revenueLastMonth?: number
  revenueGrowthPercent?: number
  successRate?: number
  totalUsers: number
  totalTours: number
}

export type RecentBooking = {
  bookingId: number
  tourId: number
  tourTitle: string
  userId: number
  userName?: string
  email?: string
  quantity?: number
  total?: number
  status?: string
  createdAt?: string
}

export type AdminSummaryStats = {
  pendingContacts: number
  totalContacts: number
  totalReviews: number
}

export function getDashboardKpis() {
  return apiFetch<DashboardKpis>('/admin/dashboard/kpis', {}, true)
}

export function getDashboardDefaults() {
  return apiFetch<{ currentYear: number; years: number[] }>('/admin/dashboard/defaults', {}, true)
}

export function getMonthlyRevenue(year: number) {
  return apiFetch<{ labels: string[]; data: number[]; year: number }>(
    `/admin/dashboard/revenue/monthly?year=${year}`,
    {},
    true,
  )
}

export function getBookingStatusDistribution() {
  return apiFetch<{ labels: string[]; data: number[] }>(
    '/admin/dashboard/bookings/status',
    {},
    true,
  )
}

export function getTopTours() {
  return apiFetch<Array<{ tourId: number; tourTitle: string; bookings: number; revenue: number }>>(
    '/admin/dashboard/top-tours',
    {},
    true,
  )
}

export function getUserSpending() {
  return apiFetch<Array<{ userId: number; name: string; email: string; purchases: number; spending: number }>>(
    '/admin/dashboard/user-spending',
    {},
    true,
  )
}

export function getTourBookings(tourId: number) {
  return apiFetch<Array<{ bookingId: number; userId: number; userName?: string; email?: string; quantity?: number; total?: number; createdAt?: string }>>(
    `/admin/dashboard/tour-bookings/${tourId}`,
    {},
    true,
  )
}

export function getRecentBookings(limit = 10) {
  return apiFetch<RecentBooking[]>(`/admin/dashboard/recent-bookings?limit=${limit}`, {}, true)
}

export function getAdminSummaryStats() {
  return apiFetch<AdminSummaryStats>('/admin/stats', {}, true)
}
