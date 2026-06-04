import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../theme/ThemeContext";
function AdminLayout() {
  const { isAdmin, logout } = useAuth();
  const { toggleTheme, themeIcon, themeTitle } = useTheme();
  const navigate = useNavigate();
  const [tourMenuOpen, setTourMenuOpen] = useState(
    () => window.location.pathname.includes("/admin/tour")
  );
  useEffect(() => {
    if (window.location.pathname.includes("/admin/tour")) setTourMenuOpen(true);
  }, []);
  function handleLogout() {
    logout();
    navigate("/login");
  }
  if (!isAdmin) {
    return /* @__PURE__ */ React.createElement("div", { className: "container py-5" }, /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, /* @__PURE__ */ React.createElement("h4", { className: "fw-bold mb-1" }, "403"), /* @__PURE__ */ React.createElement("div", null, "B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n truy c\u1EADp trang qu\u1EA3n tr\u1ECB.")));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "admin-shell" }, /* @__PURE__ */ React.createElement("header", { className: "admin-header w-100 border-bottom bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center px-4" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center gap-2" }, /* @__PURE__ */ React.createElement(Link, { to: "/" }, /* @__PURE__ */ React.createElement("img", { src: "/favicon.icon", alt: "Logo", height: 80, className: "rounded" }))), /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center gap-3" }, /* @__PURE__ */ React.createElement(Link, { to: "/", className: "btn btn-dark btn-sm shadow-sm" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-window me-1" }), "Client"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      title: themeTitle,
      "aria-label": themeTitle,
      className: "ms-2 border-0 bg-transparent",
      onClick: toggleTheme
    },
    themeIcon
  ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-danger btn-sm", onClick: handleLogout }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-box-arrow-right me-1" }), "\u0110\u0103ng xu\u1EA5t")))), /* @__PURE__ */ React.createElement("div", { className: "d-flex" }, /* @__PURE__ */ React.createElement("nav", { className: "admin-sidebar border-end bg-white" }, /* @__PURE__ */ React.createElement("ul", { className: "nav flex-column px-3 py-2" }, /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { end: true, className: "nav-link", to: "/admin" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-speedometer2 me-2" }), "Dashboard")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/revenue" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-graph-up me-2" }), "Doanh thu")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/bookings" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-journal-check me-2" }), "\u0110\u1EB7t ch\u1ED7")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/tour-performance" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-bar-chart me-2" }), "Hi\u1EC7u su\u1EA5t tour")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/user" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-people me-2" }), "Qu\u1EA3n l\xFD ng\u01B0\u1EDDi d\xF9ng")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "nav-link w-100 border-0 bg-transparent d-flex justify-content-between align-items-center",
      onClick: () => setTourMenuOpen((o) => !o)
    },
    /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "bi bi-airplane me-2" }), "Qu\u1EA3n l\xFD chuy\u1EBFn \u0111i"),
    /* @__PURE__ */ React.createElement("i", { className: `bi bi-chevron-${tourMenuOpen ? "up" : "down"} small` })
  ), tourMenuOpen && /* @__PURE__ */ React.createElement("ul", { className: "nav flex-column ps-3" }, /* @__PURE__ */ React.createElement("li", { className: "nav-item" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/tour/active" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-play-circle me-2 text-success" }), "Tour \u0111ang ho\u1EA1t \u0111\u1ED9ng")), /* @__PURE__ */ React.createElement("li", { className: "nav-item" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/tour/completed" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-check-circle me-2 text-secondary" }), "Tour \u0111\xE3 k\u1EBFt th\xFAc")))), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/promo" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-ticket-perforated me-2" }), "M\xE3 gi\u1EA3m gi\xE1")), /* @__PURE__ */ React.createElement("li", { className: "nav-item mb-1" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/contact" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-envelope me-2" }), "Qu\u1EA3n l\xFD li\xEAn h\u1EC7")), /* @__PURE__ */ React.createElement("li", { className: "nav-item" }, /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/admin/danh-gia" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-star me-2" }), "Qu\u1EA3n l\xFD \u0111\xE1nh gi\xE1")))), /* @__PURE__ */ React.createElement("main", { className: "flex-grow-1 p-4", style: { minHeight: "calc(100vh - 80px)" } }, /* @__PURE__ */ React.createElement(Outlet, null))), /* @__PURE__ */ React.createElement("footer", { className: "admin-footer mt-auto" }, /* @__PURE__ */ React.createElement("div", { className: "container-fluid py-3 border-top" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-center align-items-center small text-muted" }, "\xA9 2026 ZakiBooking Admin"))));
}
export {
  AdminLayout
};
