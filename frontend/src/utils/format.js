const FALLBACK = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";
function formatVnd(value) {
  if (value == null) return "\u2014";
  return new Intl.NumberFormat("vi-VN").format(value) + " \u20AB";
}
function imageUrl(path) {
  if (!path) return FALLBACK;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  if (path.startsWith("anh/")) return `/${path}`;
  return FALLBACK;
}
function statusLabel(s) {
  const map = {
    PENDING: "Ch\u1EDD thanh to\xE1n",
    CONFIRMED: "\u0110\xE3 x\xE1c nh\u1EADn",
    PAID: "\u0110\xE3 thanh to\xE1n",
    CANCELLED: "\u0110\xE3 hu\u1EF7",
    FAILED: "Th\u1EA5t b\u1EA1i"
  };
  return map[s] ?? s;
}
function bookingTabFilter(tab, trangThai) {
  if (tab === "all") return true;
  if (tab === "pending") return trangThai === "PENDING";
  if (tab === "paid") return trangThai === "CONFIRMED" || trangThai === "PAID";
  return trangThai === "CANCELLED" || trangThai === "FAILED";
}
export {
  bookingTabFilter,
  formatVnd,
  imageUrl,
  statusLabel
};
