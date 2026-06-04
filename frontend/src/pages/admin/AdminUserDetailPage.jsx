import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminUser, updateAdminUser } from "../../api/adminUsers";
function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ hoTen: "", number: "", vaiTro: "USER", enabled: true });
  useEffect(() => {
    if (!userId) return;
    getAdminUser(userId).then((r) => {
      const u = r.data;
      setForm({
        hoTen: u.hoTen ?? "",
        number: u.number ?? "",
        vaiTro: u.vaiTro ?? "USER",
        enabled: u.enabled !== false
      });
    }).catch(() => setMsg("Kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c user"));
  }, [userId]);
  async function onSubmit(e) {
    e.preventDefault();
    try {
      await updateAdminUser(userId, form);
      setMsg("\u0110\xE3 c\u1EADp nh\u1EADt");
    } catch (err) {
      setMsg(err.message ?? "L\u1ED7i");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0", style: { maxWidth: 640 } }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "Chi ti\u1EBFt ng\u01B0\u1EDDi d\xF9ng #", id), /* @__PURE__ */ React.createElement(Link, { to: "/admin/user", className: "btn btn-outline-secondary btn-sm" }, "Quay l\u1EA1i")), msg && /* @__PURE__ */ React.createElement("div", { className: "alert alert-info py-2" }, msg), /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "H\u1ECD t\xEAn"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: form.hoTen, onChange: (e) => setForm({ ...form, hoTen: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: form.number, onChange: (e) => setForm({ ...form, number: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Vai tr\xF2"), /* @__PURE__ */ React.createElement("select", { className: "form-select", value: form.vaiTro, onChange: (e) => setForm({ ...form, vaiTro: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "USER" }, "USER"), /* @__PURE__ */ React.createElement("option", { value: "ADMIN" }, "ADMIN"))), /* @__PURE__ */ React.createElement("div", { className: "form-check mb-3" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", checked: form.enabled, onChange: (e) => setForm({ ...form, enabled: e.target.checked }) }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Enabled")), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "C\u1EADp nh\u1EADt")));
}
export {
  AdminUserDetailPage
};
