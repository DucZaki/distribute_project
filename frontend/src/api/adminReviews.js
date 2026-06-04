import { apiFetch } from "./client";
function listReviews(page = 0, size = 50, tourId) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (tourId) q.set("tourId", String(tourId));
  return apiFetch(`/admin/reviews?${q}`, {}, true);
}
function deleteReview(id) {
  return apiFetch(`/admin/reviews/${id}`, { method: "DELETE" }, true);
}
export {
  deleteReview,
  listReviews
};
