import { apiFetch } from "./client";
function listAdminTours(status, page = 0, size = 12) {
  return apiFetch(
    `/admin/tours?status=${status}&page=${page}&size=${size}`,
    {},
    true
  );
}
function getAdminTour(id) {
  return apiFetch(`/admin/tours/${id}`, {}, true);
}
function createAdminTour(body) {
  return apiFetch("/admin/tours", { method: "POST", body: JSON.stringify(body) }, true);
}
function updateAdminTour(id, body) {
  return apiFetch(`/admin/tours/${id}`, { method: "PUT", body: JSON.stringify(body) }, true);
}
function deleteAdminTour(id) {
  return apiFetch(`/admin/tours/${id}`, { method: "DELETE" }, true);
}
function listTourSchedules(tourId) {
  return apiFetch(`/admin/tours/${tourId}/schedules`, {}, true);
}
function createTourSchedule(tourId, body) {
  return apiFetch(
    `/admin/tours/${tourId}/schedules`,
    { method: "POST", body: JSON.stringify(body) },
    true
  );
}
function updateTourSchedule(tourId, scheduleId, body) {
  return apiFetch(
    `/admin/tours/${tourId}/schedules/${scheduleId}`,
    { method: "PUT", body: JSON.stringify(body) },
    true
  );
}
function toggleTourSchedule(tourId, scheduleId) {
  return apiFetch(
    `/admin/tours/${tourId}/schedules/${scheduleId}/toggle`,
    { method: "PUT" },
    true
  );
}
function deleteTourSchedule(tourId, scheduleId) {
  return apiFetch(`/admin/tours/${tourId}/schedules/${scheduleId}`, { method: "DELETE" }, true);
}
export {
  createAdminTour,
  createTourSchedule,
  deleteAdminTour,
  deleteTourSchedule,
  getAdminTour,
  listAdminTours,
  listTourSchedules,
  toggleTourSchedule,
  updateAdminTour,
  updateTourSchedule
};
