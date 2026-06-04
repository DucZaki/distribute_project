import { apiFetch } from "./client";
function listFavorites() {
  return apiFetch("/favorites", {}, true);
}
function addFavorite(tourId) {
  return apiFetch(`/favorites/${tourId}`, { method: "POST" }, true);
}
function removeFavorite(tourId) {
  return apiFetch(`/favorites/${tourId}`, { method: "DELETE" }, true);
}
export {
  addFavorite,
  listFavorites,
  removeFavorite
};
