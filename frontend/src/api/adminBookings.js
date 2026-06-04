import { apiFetch } from "./client";
function listAdminBookings(trangThai, page = 0, size = 20) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (trangThai) q.set("trangThai", trangThai);
  return apiFetch(`/admin/bookings?${q}`, {}, true);
}
function getAdminBooking(id) {
  return apiFetch(`/admin/bookings/${id}`, {}, true);
}
function cancelAdminBooking(id, reason) {
  const q = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return apiFetch(`/admin/bookings/${id}/cancel${q}`, { method: "POST" }, true);
}
export {
  cancelAdminBooking,
  getAdminBooking,
  listAdminBookings
};
