import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelAdminBooking, listAdminBookings } from "../../api/adminBookings";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { formatVnd } from "../../utils/format";
function AdminBookingsPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState(searchParams.get("trangThai") ?? "");
  const [msg, setMsg] = useState("");
  function load(p = page) {
    listAdminBookings(status || void 0, p, 20).then((r) => {
      setItems(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
      setPage(r.data.page ?? p);
    }).catch(() => setItems([]));
  }
  useEffect(() => {
    setStatus(searchParams.get("trangThai") ?? "");
  }, [searchParams]);
  useEffect(() => {
    load(0);
  }, [status]);
  async function onCancel(id) {
    if (!confirm("Hu\u1EF7 booking n\xE0y?")) return;
    try {
      await cancelAdminBooking(id);
      setMsg("\u0110\xE3 hu\u1EF7 booking");
      load();
    } catch (e) {
      setMsg(e.message ?? "L\u1ED7i");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "Qu\u1EA3n l\xFD \u0111\u1EB7t ch\u1ED7"), /* @__PURE__ */ React.createElement("select", { className: "form-select form-select-sm", style: { width: 200 }, value: status, onChange: (e) => setStatus(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "T\u1EA5t c\u1EA3 tr\u1EA1ng th\xE1i"), /* @__PURE__ */ React.createElement("option", { value: "PENDING" }, "PENDING"), /* @__PURE__ */ React.createElement("option", { value: "CONFIRMED" }, "CONFIRMED"), /* @__PURE__ */ React.createElement("option", { value: "CANCELLED" }, "CANCELLED"), /* @__PURE__ */ React.createElement("option", { value: "FAILED" }, "FAILED"))), msg && /* @__PURE__ */ React.createElement("div", { className: "alert alert-info py-2" }, msg), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4" }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-hover mb-0" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-4" }, "ID"), /* @__PURE__ */ React.createElement("th", null, "Tour"), /* @__PURE__ */ React.createElement("th", null, "User"), /* @__PURE__ */ React.createElement("th", null, "SL"), /* @__PURE__ */ React.createElement("th", null, "T\u1ED5ng"), /* @__PURE__ */ React.createElement("th", null, "Tr\u1EA1ng th\xE1i"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Thao t\xE1c"))), /* @__PURE__ */ React.createElement("tbody", null, items.map((b) => /* @__PURE__ */ React.createElement("tr", { key: b.id }, /* @__PURE__ */ React.createElement("td", { className: "px-4 fw-bold" }, "#", b.id), /* @__PURE__ */ React.createElement("td", null, b.idChuyenDi ? /* @__PURE__ */ React.createElement(Link, { to: `/tour/${b.idChuyenDi}`, className: "text-decoration-none fw-semibold" }, b.tieuDeTour ?? `Tour #${b.idChuyenDi}`) : "-"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "fw-semibold" }, b.hoTen || `User #${b.idNguoiDung}`), /* @__PURE__ */ React.createElement("div", { className: "text-muted small" }, b.email || "-")), /* @__PURE__ */ React.createElement("td", null, b.soLuong ?? "-"), /* @__PURE__ */ React.createElement("td", { className: "fw-bold" }, b.tongGia != null ? formatVnd(Number(b.tongGia)) : b.tongTien != null ? formatVnd(Number(b.tongTien)) : "-"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge bg-secondary" }, b.trangThai)), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, b.trangThai !== "CANCELLED" && /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onCancel(b.id) }, "Hu\u1EF7")))), items.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, className: "text-center py-5 text-muted" }, "Kh\xF4ng c\xF3 booking.")))))), /* @__PURE__ */ React.createElement(AdminPagination, { page, totalPages, onPage: (p) => load(p) }));
}
export {
  AdminBookingsPage
};
