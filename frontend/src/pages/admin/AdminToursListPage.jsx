import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAdminTours } from "../../api/adminTours";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { formatVnd } from "../../utils/format";
function AdminToursListPage({ status, title }) {
  const [tours, setTours] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  function load(p = 0) {
    listAdminTours(status, p, 12).then((r) => {
      setTours(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
      setPage(r.data.page ?? p);
    }).catch(() => setTours([]));
  }
  useEffect(() => {
    load(0);
  }, [status]);
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "fw-bold mb-0" }, title), /* @__PURE__ */ React.createElement(Link, { to: "/admin/tour/create", className: "btn btn-dark" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-plus-circle" }), " T\u1EA1o chuy\u1EBFn \u0111i m\u1EDBi")), /* @__PURE__ */ React.createElement("div", { className: "row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4" }, tours.map((t) => /* @__PURE__ */ React.createElement("div", { className: "col", key: t.id }, /* @__PURE__ */ React.createElement(Link, { className: "tour-card", to: `/admin/tour/detail/${t.id}?source=${status}` }, /* @__PURE__ */ React.createElement("div", { className: "card h-100 border-0 shadow-sm tour-card" }, /* @__PURE__ */ React.createElement("img", { src: t.hinhAnh || "/anh/anh/diemden/hanoi.jpg", className: "card-img-top", style: { height: 230, objectFit: "cover" }, alt: "" }), /* @__PURE__ */ React.createElement("div", { className: "card-body text-center" }, /* @__PURE__ */ React.createElement("h6", { className: "fw-bold mb-2" }, t.tieuDe), /* @__PURE__ */ React.createElement("p", { className: "text-danger fw-bold mb-0" }, formatVnd(Number(t.gia ?? 0)))))))), tours.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "col-12 text-center text-muted py-4" }, "Kh\xF4ng c\xF3 chuy\u1EBFn \u0111i n\xE0o.")), /* @__PURE__ */ React.createElement(AdminPagination, { page, totalPages, onPage: (p) => load(p) }));
}
export {
  AdminToursListPage
};
