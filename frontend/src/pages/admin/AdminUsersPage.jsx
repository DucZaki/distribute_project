import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserSpending } from "../../api/adminDashboard";
import { deleteAdminUser, listAdminUsers } from "../../api/adminUsers";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { formatVnd } from "../../utils/format";
function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [spendingMap, setSpendingMap] = useState({});
  function load(p = 0) {
    listAdminUsers(p, 20).then((r) => {
      setUsers(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
      setPage(r.data.page ?? p);
    }).catch(() => setUsers([]));
  }
  useEffect(() => {
    load(0);
    getUserSpending().then((r) => {
      const m = {};
      (r.data ?? []).forEach((x) => {
        m[x.userId] = { purchases: x.purchases, spending: Number(x.spending) };
      });
      setSpendingMap(m);
    }).catch(() => {
    });
  }, []);
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => String(u.id).includes(q) || u.email?.toLowerCase().includes(q) || u.tenDangNhap?.toLowerCase().includes(q) || u.hoTen?.toLowerCase().includes(q)
    );
  }, [users, keyword]);
  async function onDelete(id) {
    if (!confirm("X\xF3a ng\u01B0\u1EDDi d\xF9ng n\xE0y?")) return;
    await deleteAdminUser(id);
    load(page);
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "Qu\u1EA3n l\xFD ng\u01B0\u1EDDi d\xF9ng"), /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "input-group", style: { minWidth: 280 } }, /* @__PURE__ */ React.createElement("span", { className: "input-group-text bg-white border-end-0" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-search" })), /* @__PURE__ */ React.createElement("input", { className: "form-control border-start-0", placeholder: "T\xECm theo t\xEAn, email, username, ID...", value: keyword, onChange: (e) => setKeyword(e.target.value) })), /* @__PURE__ */ React.createElement(Link, { to: "/admin/user/create", className: "btn btn-dark btn-sm" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-plus-circle me-1" }), "T\u1EA1o m\u1EDBi"))), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4" }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-hover mb-0" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-4" }, "Ng\u01B0\u1EDDi d\xF9ng"), /* @__PURE__ */ React.createElement("th", null, "Li\xEAn h\u1EC7"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Vai tr\xF2"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Booking"), /* @__PURE__ */ React.createElement("th", { className: "text-end" }, "Chi ti\xEAu"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Thao t\xE1c"))), /* @__PURE__ */ React.createElement("tbody", null, filtered.map((u) => {
    const stat = spendingMap[u.id];
    return /* @__PURE__ */ React.createElement("tr", { key: u.id }, /* @__PURE__ */ React.createElement("td", { className: "px-4" }, /* @__PURE__ */ React.createElement("div", { className: "fw-bold" }, u.hoTen || u.tenDangNhap), /* @__PURE__ */ React.createElement("div", { className: "text-muted small" }, "ID: #", u.id)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "small fw-semibold" }, u.email), /* @__PURE__ */ React.createElement("div", { className: "text-muted small" }, u.number || "-")), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement("span", { className: `badge rounded-pill px-3 ${u.vaiTro === "ADMIN" ? "bg-danger" : "bg-primary"}` }, u.vaiTro)), /* @__PURE__ */ React.createElement("td", { className: "text-center fw-bold" }, stat?.purchases ?? 0), /* @__PURE__ */ React.createElement("td", { className: "text-end fw-bold text-success" }, formatVnd(stat?.spending ?? 0)), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(Link, { to: `/admin/user/${u.id}`, className: "btn btn-sm btn-outline-primary me-1" }, "Chi ti\u1EBFt"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDelete(u.id) }, "X\xF3a")));
  }), filtered.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "text-center py-5 text-muted" }, "Kh\xF4ng c\xF3 ng\u01B0\u1EDDi d\xF9ng.")))))), /* @__PURE__ */ React.createElement(AdminPagination, { page, totalPages, onPage: (p) => load(p) }));
}
export {
  AdminUsersPage
};
