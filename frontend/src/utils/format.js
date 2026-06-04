const FALLBACK = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";
function formatVnd(value) {
  if (value == null) return "\u2014";
  return new Intl.NumberFormat("vi-VN").format(value) + " \u20AB";
}
/** Hiển thị tối đa 99+ khi số lượt đánh giá / đặt chỗ vượt 100. */
function formatCountCap99(value) {
  const n = Number(value) || 0;
  return n > 100 ? "99+" : String(n);
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
function transportLabel(value) {
  const raw = String(value ?? "").trim();
  const lower = raw.toLowerCase();
  if (!raw) return "—";
  if (lower.includes("plane") || lower.includes("flight") || lower.includes("máy bay")) return "Máy bay";
  if (lower.includes("bus") || lower.includes("xe khách")) return "Xe khách";
  if (lower.includes("train") || lower.includes("tàu hỏa") || lower.includes("tau hoa")) return "Tàu hỏa";
  if (lower.includes("ferry") || lower.includes("ship") || lower.includes("boat") || lower.includes("phà")) return "Tàu thủy / phà";
  if (lower.includes("hotel")) return "Khách sạn";
  if (lower.includes("homestay")) return "Homestay";
  if (lower.includes("resort")) return "Khu nghỉ dưỡng";
  if (lower.includes("apartment")) return "Căn hộ";
  return raw;
}
function bookingTabFilter(tab, trangThai) {
  if (tab === "all") return true;
  if (tab === "pending") return trangThai === "PENDING";
  if (tab === "paid") return trangThai === "CONFIRMED" || trangThai === "PAID";
  return trangThai === "CANCELLED" || trangThai === "FAILED";
}
export {
  bookingTabFilter,
  formatCountCap99,
  formatVnd,
  imageUrl,
  statusLabel,
  transportLabel
};
