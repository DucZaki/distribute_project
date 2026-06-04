import { apiFetch } from "./client";
function createBooking(req) {
  return apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(req)
  }, true);
}
function myBookings(page = 0, size = 10) {
  return apiFetch(
    `/bookings?page=${page}&size=${size}`,
    {},
    true
  );
}
function cancelBooking(id) {
  return apiFetch(`/bookings/${id}/cancel`, { method: "POST" }, true);
}
function applyPromo(ma, subtotal) {
  return apiFetch(
    "/bookings/promo/apply",
    { method: "POST", body: JSON.stringify({ ma, subtotal }) },
    true
  );
}
function initVnPay(bookingId, amount) {
  return apiFetch(
    "/payments/vnpay/init",
    {
      method: "POST",
      body: JSON.stringify({ bookingId, amount, orderInfo: `Thanh to\xE1n \u0111\u01A1n #${bookingId}` })
    },
    true
  );
}
function getCheckInDetail(token) {
  return apiFetch(`/check-in/${encodeURIComponent(token)}`);
}
function confirmCheckIn(token) {
  return apiFetch(
    `/check-in/${encodeURIComponent(token)}`,
    { method: "POST" },
    true
  );
}
export {
  applyPromo,
  cancelBooking,
  confirmCheckIn,
  createBooking,
  getCheckInDetail,
  initVnPay,
  myBookings
};
