import { apiFetch } from "./client";
function submitContact(payload) {
  return apiFetch("/contacts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
function getTourReviews(tourId, page = 0) {
  return apiFetch(`/reviews/tour/${tourId}?page=${page}&size=10`);
}
function getReviewSummary(tourId) {
  return apiFetch(`/reviews/tour/${tourId}/summary`);
}
function createReview(idChuyenDi, diem, noiDung) {
  return apiFetch(
    "/reviews",
    { method: "POST", body: JSON.stringify({ idChuyenDi, diem, noiDung }) },
    true
  );
}
export {
  createReview,
  getReviewSummary,
  getTourReviews,
  submitContact
};
