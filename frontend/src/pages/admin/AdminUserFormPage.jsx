import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAdminUser } from "../../api/adminUsers";
function AdminUserFormPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    tenDangNhap: "",
    email: "",
    password: "",
    hoTen: "",
    number: "",
    vaiTro: "USER",
    enabled: true
  });
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createAdminUser(form);
      navigate("/admin/user");
    } catch (err) {
      setError(err.message ?? "L\u1ED7i t\u1EA1o user");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0", style: { maxWidth: 640 } }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "T\u1EA1o ng\u01B0\u1EDDi d\xF9ng"), /* @__PURE__ */ React.createElement(Link, { to: "/admin/user", className: "btn btn-outline-secondary btn-sm" }, "Quay l\u1EA1i")), error && /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, error), /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit }, ["tenDangNhap", "email", "password", "hoTen", "number"].map((k) => /* @__PURE__ */ React.createElement("div", { className: "mb-3", key: k }, /* @__PURE__ */ React.createElement("label", { className: "form-label fw-semibold text-capitalize" }, k), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-control",
      type: k === "password" ? "password" : "text",
      required: k === "tenDangNhap" || k === "email" || k === "password",
      value: form[k],
      onChange: (e) => setForm({ ...form, [k]: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label fw-semibold" }, "Vai tr\xF2"), /* @__PURE__ */ React.createElement("select", { className: "form-select", value: form.vaiTro, onChange: (e) => setForm({ ...form, vaiTro: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "USER" }, "USER"), /* @__PURE__ */ React.createElement("option", { value: "ADMIN" }, "ADMIN"))), /* @__PURE__ */ React.createElement("div", { className: "form-check mb-3" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", checked: form.enabled, onChange: (e) => setForm({ ...form, enabled: e.target.checked }), id: "enabled" }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label", htmlFor: "enabled" }, "K\xEDch ho\u1EA1t t\xE0i kho\u1EA3n")), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "L\u01B0u")));
}
export {
  AdminUserFormPage
};
