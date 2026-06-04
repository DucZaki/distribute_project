import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { changePassword, getMe, updateMe } from "../api/users";
import { UserSidebar } from "../components/UserSidebar";
import { ApiError } from "../api/client";
function ProfilePage() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    getMe().then((r) => setUser(r.data)).catch(() => {
    });
  }, []);
  async function saveProfile(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await updateMe({ hoTen: String(fd.get("hoTen")), number: String(fd.get("number") ?? "") });
      setUser(res.data);
      setMsg("C\u1EADp nh\u1EADt h\u1ED3 s\u01A1 th\xE0nh c\xF4ng");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "L\u1ED7i c\u1EADp nh\u1EADt");
    }
  }
  async function savePassword(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await changePassword(String(fd.get("oldPassword")), String(fd.get("newPassword")));
      setMsg("\u0110\u1ED5i m\u1EADt kh\u1EA9u th\xE0nh c\xF4ng");
      e.currentTarget.reset();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Kh\xF4ng \u0111\u1ED5i \u0111\u01B0\u1EE3c m\u1EADt kh\u1EA9u");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container my-5 pt-4" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement(UserSidebar, { active: "profile" }), /* @__PURE__ */ React.createElement("div", { className: "col-lg-9" }, /* @__PURE__ */ React.createElement("h3", { className: "fw-bold mb-4" }, "H\u1ED3 s\u01A1 c\xE1 nh\xE2n"), msg && /* @__PURE__ */ React.createElement("div", { className: "alert alert-success" }, msg), err && /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, err), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold" }, "Th\xF4ng tin t\xE0i kho\u1EA3n"), /* @__PURE__ */ React.createElement("p", { className: "text-muted small" }, "Email: ", user?.email, " \xB7 Vai tr\xF2: ", user?.vaiTro), /* @__PURE__ */ React.createElement("form", { onSubmit: saveProfile, className: "row g-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "H\u1ECD t\xEAn"), /* @__PURE__ */ React.createElement("input", { name: "hoTen", className: "form-control", defaultValue: user?.hoTen ?? "", required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"), /* @__PURE__ */ React.createElement("input", { name: "number", className: "form-control", defaultValue: user?.number ?? "" })), /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "L\u01B0u thay \u0111\u1ED5i"))))), /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold" }, "\u0110\u1ED5i m\u1EADt kh\u1EA9u"), /* @__PURE__ */ React.createElement("form", { onSubmit: savePassword, className: "row g-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement("input", { name: "oldPassword", type: "password", className: "form-control", placeholder: "M\u1EADt kh\u1EA9u c\u0169", required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement("input", { name: "newPassword", type: "password", className: "form-control", placeholder: "M\u1EADt kh\u1EA9u m\u1EDBi", minLength: 6, required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-outline-primary w-100" }, "\u0110\u1ED5i m\u1EADt kh\u1EA9u"))))), /* @__PURE__ */ React.createElement("p", { className: "mt-3 small" }, /* @__PURE__ */ React.createElement(Link, { to: "/user/bookings" }, "Xem \u0111\u01A1n \u0111\u1EB7t ch\u1ED7 \u2192")))));
}
export {
  ProfilePage
};
