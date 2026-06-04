import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
function UserSidebar({ active }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const item = (key, to, label, icon) => /* @__PURE__ */ React.createElement(
    Link,
    {
      to,
      className: `list-group-item list-group-item-action border-0 mb-1${active === key || loc.pathname === to ? " fw-bold booking-sidebar-active rounded" : ""}`
    },
    /* @__PURE__ */ React.createElement("i", { className: `bi ${icon} me-2` }),
    label
  );
  return /* @__PURE__ */ React.createElement("div", { className: "col-lg-3 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-body p-4" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center mb-3" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "rounded-circle booking-avatar-bg d-flex align-items-center justify-content-center fw-bold overflow-hidden",
      style: { width: 48, height: 48, fontSize: "1.2rem" }
    },
    user?.anhDaiDien ? /* @__PURE__ */ React.createElement("img", { src: user.anhDaiDien, className: "w-100 h-100 object-cover", alt: "" }) : /* @__PURE__ */ React.createElement("span", null, user?.hoTen?.charAt(0) ?? "?")
  ), /* @__PURE__ */ React.createElement("div", { className: "ms-3" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0 fw-bold" }, user?.hoTen ?? "Kh\xE1ch h\xE0ng"), /* @__PURE__ */ React.createElement("p", { className: "mb-0 text-muted small" }, user?.email ?? ""))), /* @__PURE__ */ React.createElement("div", { className: "list-group list-group-flush small" }, item("profile", "/user/profile", "T\xE0i kho\u1EA3n", "bi-person"), item("bookings", "/user/bookings", "\u0110\u01A1n \u0111\u1EB7t ch\u1ED7", "bi-luggage"), item("favorites", "/favorites/my-favorites", "C\xE1c tour y\xEAu th\xEDch", "bi-bookmark-heart"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "list-group-item list-group-item-action text-danger fw-bold border-0", onClick: logout }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-box-arrow-right me-2" }), "\u0110\u0103ng xu\u1EA5t")))));
}
export {
  UserSidebar
};
