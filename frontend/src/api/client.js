const BASE = import.meta.env.VITE_API_URL ?? "/api";
class ApiError extends Error {
  status;
  body;
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}
function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function apiFetch(path, init = {}, auth = false) {
  const headers = {
    "Content-Type": "application/json",
    ...init.headers ?? {},
    ...auth ? authHeaders() : {}
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new ApiError(
      body?.message ?? `HTTP ${res.status}`,
      res.status,
      body ?? void 0
    );
  }
  return body;
}
export {
  ApiError,
  apiFetch
};
