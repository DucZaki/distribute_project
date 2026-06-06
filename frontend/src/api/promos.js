import { apiFetch } from "./client";

function getActivePromos() {
  return apiFetch("/bookings/promo/active");
}

export { getActivePromos };
