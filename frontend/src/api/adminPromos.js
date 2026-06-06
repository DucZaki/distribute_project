import { apiFetch } from "./client";
function listPromos(page = 0, size = 20) {
  return apiFetch(`/admin/promos?page=${page}&size=${size}`, {}, true);
}
function getPromo(id) {
  return apiFetch(`/admin/promos/${id}`, {}, true);
}
function createPromo(body) {
  return apiFetch("/admin/promos", { method: "POST", body: JSON.stringify(body) }, true);
}
function updatePromo(id, body) {
  return apiFetch(`/admin/promos/${id}`, { method: "PUT", body: JSON.stringify(body) }, true);
}
function deletePromo(id) {
  return apiFetch(`/admin/promos/${id}`, { method: "DELETE" }, true);
}
export {
  createPromo,
  deletePromo,
  getPromo,
  listPromos,
  updatePromo
};
