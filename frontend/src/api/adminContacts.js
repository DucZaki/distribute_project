import { apiFetch } from "./client";
function listContacts(trangThai, page = 0, size = 20) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (trangThai) q.set("trangThai", trangThai);
  return apiFetch(`/admin/contacts?${q}`, {}, true);
}
function getContact(id) {
  return apiFetch(`/admin/contacts/${id}`, {}, true);
}
function updateContactStatus(id, trangThai) {
  return apiFetch(
    `/admin/contacts/${id}/status?trangThai=${encodeURIComponent(trangThai)}`,
    { method: "PUT" },
    true
  );
}
function deleteContact(id) {
  return apiFetch(`/admin/contacts/${id}`, { method: "DELETE" }, true);
}
export {
  deleteContact,
  getContact,
  listContacts,
  updateContactStatus
};
