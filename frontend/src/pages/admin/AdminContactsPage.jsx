import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteContact, listContacts, updateContactStatus } from "../../api/adminContacts";
import { AdminPagination } from "../../components/admin/AdminPagination";
function AdminContactsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("");
  function load(p = 0) {
    listContacts(status || void 0, p, 20).then((r) => {
      setItems(r.data.content ?? []);
      setTotalPages(r.data.totalPages ?? 0);
      setPage(r.data.page ?? p);
    }).catch(() => setItems([]));
  }
  useEffect(() => {
    load(0);
  }, [status]);
  async function markRead(id) {
    await updateContactStatus(id, "READ");
    load(page);
  }
  async function onDelete(id) {
    if (!confirm("X\xF3a li\xEAn h\u1EC7?")) return;
    await deleteContact(id);
    load(page);
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "Qu\u1EA3n l\xFD li\xEAn h\u1EC7"), /* @__PURE__ */ React.createElement("select", { className: "form-select form-select-sm", style: { width: 180 }, value: status, onChange: (e) => setStatus(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "T\u1EA5t c\u1EA3"), /* @__PURE__ */ React.createElement("option", { value: "NEW" }, "M\u1EDBi"), /* @__PURE__ */ React.createElement("option", { value: "READ" }, "\u0110\xE3 \u0111\u1ECDc"))), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4" }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-hover mb-0" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-4" }, "Ng\u01B0\u1EDDi g\u1EEDi"), /* @__PURE__ */ React.createElement("th", null, "Ti\xEAu \u0111\u1EC1"), /* @__PURE__ */ React.createElement("th", null, "Tr\u1EA1ng th\xE1i"), /* @__PURE__ */ React.createElement("th", null, "Ng\xE0y"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Thao t\xE1c"))), /* @__PURE__ */ React.createElement("tbody", null, items.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { className: "px-4" }, /* @__PURE__ */ React.createElement("div", { className: "fw-bold" }, c.hoTen), /* @__PURE__ */ React.createElement("div", { className: "small text-muted" }, c.email)), /* @__PURE__ */ React.createElement("td", null, c.tieuDe || c.noiDung?.slice(0, 40)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge bg-secondary" }, c.trangThai)), /* @__PURE__ */ React.createElement("td", { className: "small text-muted" }, c.createdAt ? String(c.createdAt).slice(0, 16) : "-"), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(Link, { to: `/admin/contact/${c.id}`, className: "btn btn-sm btn-outline-primary me-1" }, "Xem"), c.trangThai === "NEW" && /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-success me-1", onClick: () => markRead(c.id) }, "\u0110\xE3 \u0111\u1ECDc"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDelete(c.id) }, "X\xF3a")))), items.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 5, className: "text-center py-5 text-muted" }, "Kh\xF4ng c\xF3 li\xEAn h\u1EC7.")))))), /* @__PURE__ */ React.createElement(AdminPagination, { page, totalPages, onPage: (p) => load(p) }));
}
export {
  AdminContactsPage
};
