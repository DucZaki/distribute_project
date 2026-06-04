import { apiFetch } from "./client";
function getDashboardKpis() {
  return apiFetch("/admin/dashboard/kpis", {}, true);
}
function getDashboardDefaults() {
  return apiFetch("/admin/dashboard/defaults", {}, true);
}
function getMonthlyRevenue(year) {
  return apiFetch(
    `/admin/dashboard/revenue/monthly?year=${year}`,
    {},
    true
  );
}
function getBookingStatusDistribution() {
  return apiFetch(
    "/admin/dashboard/bookings/status",
    {},
    true
  );
}
function getTopTours() {
  return apiFetch(
    "/admin/dashboard/top-tours",
    {},
    true
  );
}
function getUserSpending() {
  return apiFetch(
    "/admin/dashboard/user-spending",
    {},
    true
  );
}
function getTourBookings(tourId) {
  return apiFetch(
    `/admin/dashboard/tour-bookings/${tourId}`,
    {},
    true
  );
}
function getRecentBookings(limit = 10) {
  return apiFetch(`/admin/dashboard/recent-bookings?limit=${limit}`, {}, true);
}
function getAdminSummaryStats() {
  return apiFetch("/admin/stats", {}, true);
}
export {
  getAdminSummaryStats,
  getBookingStatusDistribution,
  getDashboardDefaults,
  getDashboardKpis,
  getMonthlyRevenue,
  getRecentBookings,
  getTopTours,
  getTourBookings,
  getUserSpending
};
