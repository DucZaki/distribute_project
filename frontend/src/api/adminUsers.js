import { apiFetch } from "./client";
function listAdminUsers(page = 0, size = 20) {
  return apiFetch(`/admin/users?page=${page}&size=${size}`, {}, true);
}
function getAdminUser(id) {
  return apiFetch(`/admin/users/${id}`, {}, true);
}
function createAdminUser(body) {
  return apiFetch("/admin/users", { method: "POST", body: JSON.stringify(body) }, true);
}
function updateAdminUser(id, body) {
  return apiFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }, true);
}
function deleteAdminUser(id) {
  return apiFetch(`/admin/users/${id}`, { method: "DELETE" }, true);
}
export {
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  updateAdminUser
};
