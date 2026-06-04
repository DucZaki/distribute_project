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
function getBooking(id) {
  return apiFetch(`/bookings/${id}`, {}, true);
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
function initVnPay(bookingId) {
  return apiFetch(
    "/payments/vnpay/init",
    {
      method: "POST",
      body: JSON.stringify({ bookingId, orderInfo: `Donhang${bookingId}` })
    },
    true
  );
}
function repayVnPay(bookingId) {
  return apiFetch(`/payments/vnpay/repay/${bookingId}`, { method: "POST" }, true);
}
async function redirectToVnPay(bookingId, repay = false) {
  const res = repay ? await repayVnPay(bookingId) : await initVnPay(bookingId);
  if (res.data?.redirectUrl) {
    // replace: không giữ URL VNPay cũ trong history (Back → timeout)
    window.location.replace(res.data.redirectUrl);
    return true;
  }
  throw new Error("Không nhận được link VNPay");
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
  getBooking,
  getCheckInDetail,
  initVnPay,
  myBookings,
  redirectToVnPay,
  repayVnPay
};
