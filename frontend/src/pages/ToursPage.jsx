import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchTours } from "../api/tours";
import { formatTourCode } from "../utils/tourCode";
import { TourCardStats } from "../components/TourCardStats";
import { formatVnd, imageUrl, transportLabel } from "../utils/format";
const DEST_OPTIONS = [
  "Sapa",
  "H\u1EA1 Long",
  "\u0110\xE0 N\u1EB5ng",
  "Hu\u1EBF",
  "Ph\xFA Qu\u1ED1c",
  "C\u1EA7n Th\u01A1",
  "Th\xE1i Lan",
  "Singapore",
  "H\xE0n Qu\u1ED1c",
  "Ph\xE1p",
  "\u0110\u1EE9c",
  "M\u1EF9",
  "Canada"
];
function ToursPage() {
  const [params, setParams] = useSearchParams();
  const diemDen = params.get("diemDen") ?? params.get("thanhPho") ?? params.get("quocGia") ?? "";
  const ngayDi = params.get("ngayDi") ?? "";
  const khoangGia = params.get("khoangGia") ?? "";
  const sort = params.get("sort") ?? "popular";
  const page = Number(params.get("page") ?? "0");
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    searchTours({
      diemDen: diemDen || void 0,
      thanhPho: params.get("thanhPho") ?? void 0,
      quocGia: params.get("quocGia") ?? void 0,
      ngayDi: ngayDi || void 0,
      khoangGia: khoangGia || void 0,
      sort: sort === "popular" ? void 0 : sort,
      page
    }).then((r) => {
      setTours(r.data.content ?? []);
      setTotal(r.data.totalElements ?? 0);
      setTotalPages(r.data.totalPages || 1);
    }).catch(() => setTours([])).finally(() => setLoading(false));
  }, [params, diemDen, ngayDi, khoangGia, sort, page]);
  function applyFilter(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    ["diemDen", "ngayDi", "khoangGia"].forEach((k) => {
      const v = String(fd.get(k) ?? "");
      if (v) next.set(k, v);
    });
    if (sort) next.set("sort", sort);
    setParams(next);
  }
  function goPage(p) {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("section", { className: "container mt-5 pt-4 bg-white tour-list-heading" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-2 text-black" }, "Danh sách điểm đến"), /* @__PURE__ */ React.createElement("p", { className: "text-muted mb-0 d-md-none" }, "Lọc nhanh, chọn tour phù hợp và đặt chỉ trong vài bước.")), /* @__PURE__ */ React.createElement("div", { className: "container mb-5 bg-light" }, /* @__PURE__ */ React.createElement("section", { className: "bg-light py-5" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "mobile-filter-shell d-md-none mb-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary w-100 fw-bold mobile-filter-toggle",
      type: "button",
      "data-bs-toggle": "collapse",
      "data-bs-target": "#tourFilters",
      "aria-expanded": "false",
      "aria-controls": "tourFilters"
    },
    /* @__PURE__ */ React.createElement("i", { className: "bi bi-sliders me-2" }),
    "L\u1ECDc tour ph\xF9 h\u1EE3p"
  )), /* @__PURE__ */ React.createElement("div", { className: "row align-items-start" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "col-md-3 border-end bg-white p-4 rounded shadow-sm filters-panel collapse d-md-block",
      id: "tourFilters"
    },
    /* @__PURE__ */ React.createElement("h6", { className: "fw-bold mb-3" }, "BỘ LỌC TÌM KIẾM"),
    /* @__PURE__ */ React.createElement("form", { onSubmit: applyFilter }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "\u0110i\u1EC3m \u0111\u1EBFn"), /* @__PURE__ */ React.createElement("select", { className: "form-select select-premium", name: "diemDen", defaultValue: diemDen }, /* @__PURE__ */ React.createElement("option", { value: "" }, "-- T\u1EA5t c\u1EA3 \u0111i\u1EC3m \u0111\u1EBFn --"), DEST_OPTIONS.map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d)))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y \u0111i (t\u1EEB)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "form-control zaki-date",
        name: "ngayDi",
        defaultValue: ngayDi,
        placeholder: "dd/mm/yyyy",
        inputMode: "numeric"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Kho\u1EA3ng gi\xE1"), /* @__PURE__ */ React.createElement("select", { className: "form-select select-premium", name: "khoangGia", defaultValue: khoangGia }, /* @__PURE__ */ React.createElement("option", { value: "" }, "-- T\u1EA5t c\u1EA3 --"), /* @__PURE__ */ React.createElement("option", { value: "DUOI5" }, "D\u01B0\u1EDBi 5 tri\u1EC7u"), /* @__PURE__ */ React.createElement("option", { value: "5_10" }, "5 - 10 tri\u1EC7u"), /* @__PURE__ */ React.createElement("option", { value: "TREN10" }, "Tr\xEAn 10 tri\u1EC7u"))), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-warning fw-bold w-100" }, "\xC1p d\u1EE5ng"))
  ), /* @__PURE__ */ React.createElement("div", { className: "col-md-9" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center mb-3" }, /* @__PURE__ */ React.createElement("p", { className: "mb-0" }, "T\xECm th\u1EA5y ", /* @__PURE__ */ React.createElement("strong", null, loading ? "\u2026" : total), " tour ph\xF9 h\u1EE3p"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select w-100 w-md-auto select-premium",
      value: sort,
      onChange: (e) => {
        const next = new URLSearchParams(params);
        if (e.target.value) next.set("sort", e.target.value);
        else next.delete("sort");
        setParams(next);
      }
    },
    /* @__PURE__ */ React.createElement("option", { value: "popular" }, "Nổi bật → nhiều lượt đặt → đánh giá cao"),
    /* @__PURE__ */ React.createElement("option", { value: "priceAsc" }, "Gi\xE1 t\u0103ng d\u1EA7n"),
    /* @__PURE__ */ React.createElement("option", { value: "priceDesc" }, "Gi\xE1 gi\u1EA3m d\u1EA7n")
  )), loading && /* @__PURE__ */ React.createElement("p", { className: "text-muted" }, /* @__PURE__ */ React.createElement("span", { className: "spinner-border spinner-border-sm me-2" }), "\u0110ang t\u1EA3i tour..."), !loading && tours.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "alert alert-info text-center p-5 rounded shadow-sm" }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold mb-2" }, "T\u1EA1m th\u1EDDi kh\xF4ng c\xF3 chuy\u1EBFn \u0111i n\xE0o t\u1ED3n t\u1EA1i"), /* @__PURE__ */ React.createElement("p", { className: "mb-0 text-muted" }, "Vui l\xF2ng th\u1EED l\u1EA1i v\u1EDBi \u0111i\u1EC3m \u0111\u1EBFn ho\u1EB7c kho\u1EA3ng gi\xE1 kh\xE1c")), !loading && tours.map((ds) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: ds.id,
      className: "d-flex border rounded mb-3 shadow-sm tour-list-card overflow-hidden position-relative"
    },
    /* @__PURE__ */ React.createElement("div", { className: "tour-list-card-media flex-shrink-0" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: imageUrl(ds.hinhAnh ?? ds.diemDen?.hinhAnh),
        className: "tour-list-card-img",
        alt: ds.tieuDe
      }
    ), ds.noiBat && /* @__PURE__ */ React.createElement("span", { className: "badge bg-danger tour-list-hot-badge" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-fire me-1" }), "HOT TOUR")),
    /* @__PURE__ */ React.createElement("div", { className: "p-3 flex-grow-1 tour-list-card-info min-w-0" }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold mb-2 tour-list-card-title" }, /* @__PURE__ */ React.createElement(Link, { to: `/tour/${ds.id}`, className: "text-decoration-none" }, ds.tieuDe)), /* @__PURE__ */ React.createElement(TourCardStats, { averageRating: ds.averageRating, ratingCount: ds.ratingCount, bookingCount: ds.bookingCount }), /* @__PURE__ */ React.createElement("p", { className: "mb-1 text-muted" }, "Mã tour: ", /* @__PURE__ */ React.createElement("strong", { className: "text-body" }, formatTourCode(ds.id))), /* @__PURE__ */ React.createElement("p", { className: "mb-2 text-muted" }, "Phương tiện: ", /* @__PURE__ */ React.createElement("span", null, transportLabel(ds.phuongTien?.loai ?? ds.phuongTien?.ten)), /* @__PURE__ */ React.createElement("span", { className: "mx-1" }, "|"), "Khởi hành: ", /* @__PURE__ */ React.createElement("span", null, ds.diemDon?.ten ?? "—")), /* @__PURE__ */ React.createElement("p", { className: "text-danger fw-bold fs-5 mb-0" }, formatVnd(ds.gia))),
    /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center px-3 tour-list-card-action flex-shrink-0" }, /* @__PURE__ */ React.createElement(Link, { to: `/tour/${ds.id}`, className: "btn btn-primary fw-bold px-4" }, "Xem chi ti\u1EBFt"))
  )), totalPages > 1 && /* @__PURE__ */ React.createElement("ul", { className: "pagination zaki-pagination justify-content-center mt-4" }, /* @__PURE__ */ React.createElement("li", { className: `page-item${page <= 0 ? " disabled" : ""}` }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "page-link", onClick: () => goPage(page - 1) }, "\xAB")), Array.from({ length: totalPages }, (_, i) => /* @__PURE__ */ React.createElement("li", { key: i, className: `page-item${i === page ? " active" : ""}` }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "page-link", onClick: () => goPage(i) }, i + 1))), /* @__PURE__ */ React.createElement("li", { className: `page-item${page >= totalPages - 1 ? " disabled" : ""}` }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "page-link", onClick: () => goPage(page + 1) }, "\xBB")))))))));
}
export {
  ToursPage
};
