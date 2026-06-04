import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContact, updateContactStatus } from "../../api/adminContacts";
function AdminContactDetailPage() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  useEffect(() => {
    if (!id) return;
    getContact(Number(id)).then((r) => {
      setContact(r.data);
      if (r.data?.trangThai === "NEW") {
        updateContactStatus(r.data.id, "READ").then((updated) => setContact(updated.data)).catch(() => {
        });
      }
    }).catch(() => setContact(null));
  }, [id]);
  if (!contact) return /* @__PURE__ */ React.createElement("div", { className: "text-muted py-5" }, "\u0110ang t\u1EA3i...");
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0", style: { maxWidth: 720 } }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "Chi ti\u1EBFt li\xEAn h\u1EC7"), /* @__PURE__ */ React.createElement(Link, { to: "/admin/contact", className: "btn btn-outline-secondary btn-sm" }, "Quay l\u1EA1i")), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4 p-4" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "H\u1ECD t\xEAn:"), " ", contact.hoTen), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", contact.email), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "S\u0110T:"), " ", contact.soDienThoai || "-"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Ti\xEAu \u0111\u1EC1:"), " ", contact.tieuDe || "-"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Tr\u1EA1ng th\xE1i:"), " ", contact.trangThai), /* @__PURE__ */ React.createElement("hr", null), /* @__PURE__ */ React.createElement("div", { className: "bg-light p-3 rounded" }, contact.noiDung)));
}
export {
  AdminContactDetailPage
};
