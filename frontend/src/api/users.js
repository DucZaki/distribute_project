import { apiFetch } from "./client";
function getMe() {
  return apiFetch("/users/me", {}, true);
}
function updateMe(payload) {
  return apiFetch("/users/me", { method: "PUT", body: JSON.stringify(payload) }, true);
}
function changePassword(oldPassword, newPassword) {
  return apiFetch(
    "/users/me/password",
    { method: "POST", body: JSON.stringify({ oldPassword, newPassword }) },
    true
  );
}
export {
  changePassword,
  getMe,
  updateMe
};
