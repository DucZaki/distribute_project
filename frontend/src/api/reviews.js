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
/** Tất cả đánh giá (phân trang) — dùng cho trang chủ. */
function listReviews(page = 0, size = 50) {
  return apiFetch(`/reviews?page=${page}&size=${size}`);
}
/** Gộp mọi trang đánh giá. */
async function getAllReviews(maxPages = 20) {
  const all = [];
  let page = 0;
  while (page < maxPages) {
    const res = await listReviews(page, 50);
    const chunk = res.data?.content ?? [];
    all.push(...chunk);
    if (res.data?.last || chunk.length === 0) break;
    page += 1;
  }
  return all;
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
  getAllReviews,
  getReviewSummary,
  getTourReviews,
  listReviews,
  submitContact
};
