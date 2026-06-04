function priceRangeFromKhoangGia(khoangGia) {
  if (!khoangGia) return { giaTu: void 0, giaDen: void 0 };
  if (khoangGia === "DUOI5") return { giaTu: void 0, giaDen: 5e6 };
  if (khoangGia === "5_10") return { giaTu: 5e6, giaDen: 1e7 };
  if (khoangGia === "TREN10") return { giaTu: 1e7, giaDen: void 0 };
  return { giaTu: void 0, giaDen: void 0 };
}
function parseNgayDi(raw) {
  if (!raw) return void 0;
  if (raw.includes("/")) {
    const [d, m, y] = raw.split("/");
    if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return raw;
}
export {
  parseNgayDi,
  priceRangeFromKhoangGia
};
