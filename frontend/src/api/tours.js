import { apiFetch } from "./client";
import { parseNgayDi, priceRangeFromKhoangGia } from "../utils/searchFilters";
function getFeaturedTours(limit = 3) {
  const cap = Math.min(Math.max(Number(limit) || 3, 1), 12);
  return apiFetch(`/tours/featured?limit=${cap}`);
}
function getFeaturedDestinations() {
  return apiFetch("/tours/destinations/featured");
}
function searchTours(params) {
  const q = new URLSearchParams();
  const keyword = params.keyword ?? params.diemDen ?? params.thanhPho ?? params.quocGia;
  if (keyword) q.set("keyword", keyword);
  if (params.sort) q.set("sort", params.sort);
  const ngay = parseNgayDi(params.ngayDi);
  if (ngay) q.set("ngayTu", ngay);
  const { giaTu, giaDen } = priceRangeFromKhoangGia(params.khoangGia);
  if (giaTu != null) q.set("giaTu", String(giaTu));
  if (giaDen != null) q.set("giaDen", String(giaDen));
  q.set("page", String(params.page ?? 0));
  q.set("size", String(params.size ?? 12));
  return apiFetch(`/tours?${q}`);
}
/** Contract giống monolith GET /api/tour/nearby — trả về object trong ApiResponse.data */
async function getNearbyTours(params) {
  const q = new URLSearchParams();
  if (params.lat != null) q.set("lat", String(params.lat));
  if (params.lng != null) q.set("lng", String(params.lng));
  if (params.city) q.set("city", params.city);
  q.set("radiusKm", String(params.radiusKm ?? 100));
  q.set("limit", String(params.limit ?? params.size ?? 6));
  q.set("page", String(params.page ?? 0));
  const res = await apiFetch(`/tours/nearby?${q}`);
  return res.data;
}
function getTour(id) {
  return apiFetch(`/tours/${id}`);
}
function fetchFlightQuote(tourId, nkhId, diemDonId, refresh = false) {
  const q = new URLSearchParams({
    nkhId: String(nkhId),
    diemDonId: String(diemDonId),
    refresh: String(refresh)
  });
  return apiFetch(`/tours/${tourId}/flight-quote?${q}`);
}
export {
  fetchFlightQuote,
  getFeaturedDestinations,
  getFeaturedTours,
  getNearbyTours,
  getTour,
  searchTours
};
