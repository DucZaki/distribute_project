import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useNavDockScroll } from "../hooks/useNavDockScroll";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { Chatbot } from "./Chatbot";
function ZakiLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toggleTheme, themeIcon, themeTitle } = useTheme();
  useNavDockScroll();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  function navSearch(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    ["diemDen", "ngayDi", "khoangGia"].forEach((k) => {
      const v = String(fd.get(k) ?? "");
      if (v) params.set(k, v);
    });
    setSearchOpen(false);
    navigate(`/tour?${params}`);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("nav", { className: "premium-nav-dock d-flex align-items-center justify-content-between" }, /* @__PURE__ */ React.createElement(Link, { className: "navbar-brand d-flex align-items-center", to: "/" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "/favicon.icon",
      alt: "ZakiBooking",
      className: "nav-brand-logo rounded-3",
      onError: (e) => {
        ;
        e.target.style.display = "none";
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "d-none d-lg-flex align-items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "nav-item dropdown position-static" }, /* @__PURE__ */ React.createElement("a", { className: "nav-link dropdown-toggle", href: "#", "data-bs-toggle": "dropdown" }, "Destinations"), /* @__PURE__ */ React.createElement("div", { className: "dropdown-menu border-0 shadow-lg mt-3 mega-menu p-4", style: { borderRadius: 24, minWidth: 600 } }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("h6", { className: "fw-bold mb-3", style: { color: "var(--bs-primary)" } }, "TRONG N\u01AF\u1EDAC"), ["Sapa", "H\u1EA1 Long", "\u0110\xE0 N\u1EB5ng", "Hu\u1EBF"].map((c) => /* @__PURE__ */ React.createElement(Link, { key: c, to: `/tour?thanhPho=${encodeURIComponent(c)}`, className: "dropdown-item rounded-3" }, c))), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("h6", { className: "fw-bold mb-3", style: { color: "var(--bs-primary)" } }, "N\u01AF\u1EDAC NGO\xC0I"), ["Th\xE1i Lan", "H\xE0n Qu\u1ED1c", "Ph\xE1p"].map((c) => /* @__PURE__ */ React.createElement(Link, { key: c, to: `/tour?quocGia=${encodeURIComponent(c)}`, className: "dropdown-item rounded-3" }, c)))))), /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/tour" }, "Tours"), /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/tin-tuc" }, "News"), /* @__PURE__ */ React.createElement(NavLink, { className: "nav-link", to: "/contact" }, "Contact Us")), /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn p-0 border-0 nav-search-toggle",
      "aria-label": "T\xECm ki\u1EBFm tour",
      onClick: () => setSearchOpen((v) => !v)
    },
    /* @__PURE__ */ React.createElement("i", { className: "bi bi-search fs-5" })
  ), isAdmin && /* @__PURE__ */ React.createElement(Link, { to: "/admin", className: "btn btn-dark rounded-pill px-3 d-flex align-items-center gap-2", style: { fontSize: "0.85rem", fontWeight: 700 } }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-shield-lock-fill" }), " Admin"), isAuthenticated ? /* @__PURE__ */ React.createElement("div", { className: "dropdown" }, /* @__PURE__ */ React.createElement("div", { className: "user-profile-icon", "data-bs-toggle": "dropdown", role: "button" }, user?.anhDaiDien ? /* @__PURE__ */ React.createElement("img", { src: user.anhDaiDien, className: "w-100 h-100 rounded-circle object-cover", alt: "" }) : /* @__PURE__ */ React.createElement("i", { className: "bi bi-person" })), /* @__PURE__ */ React.createElement("ul", { className: "dropdown-menu dropdown-menu-end shadow border-0 mt-3", style: { borderRadius: 16 } }, isAdmin && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Link, { className: "dropdown-item fw-bold", to: "/admin", style: { color: "var(--bs-primary)" } }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-shield-lock-fill me-2" }), "Admin Panel")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("hr", { className: "dropdown-divider" }))), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Link, { className: "dropdown-item", to: "/user/profile" }, "H\u1ED3 s\u01A1 c\xE1 nh\xE2n")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement(Link, { className: "dropdown-item", to: "/user/bookings" }, "\u0110\u01A1n \u0111\u1EB7t ch\u1ED7")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("hr", { className: "dropdown-divider" })), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("button", { type: "button", className: "dropdown-item text-danger fw-bold", onClick: logout }, "\u0110\u0103ng xu\u1EA5t")))) : /* @__PURE__ */ React.createElement(Link, { to: "/login", className: "btn btn-dark rounded-pill px-4" }, "Sign in"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn p-0 border-0 ms-1",
      title: themeTitle,
      "aria-label": themeTitle,
      style: { background: "none", fontSize: "1.2rem" },
      onClick: toggleTheme
    },
    themeIcon
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-dark rounded-circle d-lg-none mobile-menu-toggle",
      type: "button",
      "data-bs-toggle": "offcanvas",
      "data-bs-target": "#mobileMenu",
      "aria-controls": "mobileMenu",
      "aria-label": "M\u1EDF menu"
    },
    /* @__PURE__ */ React.createElement("i", { className: "bi bi-list fs-5" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "offcanvas offcanvas-end mobile-menu-panel", tabIndex: -1, id: "mobileMenu", "aria-labelledby": "mobileMenuLabel" }, /* @__PURE__ */ React.createElement("div", { className: "offcanvas-header" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center gap-2" }, /* @__PURE__ */ React.createElement("img", { src: "/favicon.icon", alt: "ZakiBooking", height: 38, className: "rounded-3", onError: (e) => {
    e.target.style.display = "none";
  } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "offcanvas-title fw-bold mb-0", id: "mobileMenuLabel" }, "ZakiBooking"), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "\u0110\u1EB7t tour nhanh h\u01A1n tr\xEAn \u0111i\u1EC7n tho\u1EA1i"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "offcanvas", "aria-label": "\u0110\xF3ng" })), /* @__PURE__ */ React.createElement("div", { className: "offcanvas-body" }, /* @__PURE__ */ React.createElement("div", { className: "mobile-menu-section" }, /* @__PURE__ */ React.createElement(Link, { to: "/tour", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-compass" }), /* @__PURE__ */ React.createElement("span", null, "T\u1EA5t c\u1EA3 tour")), /* @__PURE__ */ React.createElement(Link, { to: "/tin-tuc", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-newspaper" }), /* @__PURE__ */ React.createElement("span", null, "Tin t\u1EE9c")), /* @__PURE__ */ React.createElement(Link, { to: "/contact", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-headset" }), /* @__PURE__ */ React.createElement("span", null, "Li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3"))), /* @__PURE__ */ React.createElement("div", { className: "mobile-menu-section" }, /* @__PURE__ */ React.createElement("div", { className: "mobile-menu-title" }, "\u0110i\u1EC3m \u0111\u1EBFn ph\u1ED5 bi\u1EBFn"), /* @__PURE__ */ React.createElement("div", { className: "mobile-destination-grid" }, ["Sapa", "H\u1EA1 Long", "\u0110\xE0 N\u1EB5ng", "Hu\u1EBF", "Th\xE1i Lan", "H\xE0n Qu\u1ED1c"].map((c) => /* @__PURE__ */ React.createElement(Link, { key: c, to: `/tour?thanhPho=${encodeURIComponent(c)}`, "data-bs-dismiss": "offcanvas" }, c)))), isAuthenticated && /* @__PURE__ */ React.createElement("div", { className: "mobile-menu-section" }, /* @__PURE__ */ React.createElement("div", { className: "mobile-menu-title" }, "T\xE0i kho\u1EA3n"), /* @__PURE__ */ React.createElement(Link, { to: "/user/profile", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-person" }), /* @__PURE__ */ React.createElement("span", null, "H\u1ED3 s\u01A1 c\xE1 nh\xE2n")), /* @__PURE__ */ React.createElement(Link, { to: "/user/bookings", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-luggage" }), /* @__PURE__ */ React.createElement("span", null, "\u0110\u01A1n \u0111\u1EB7t ch\u1ED7")), /* @__PURE__ */ React.createElement(Link, { to: "/favorites/my-favorites", className: "mobile-menu-link", "data-bs-dismiss": "offcanvas" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-bookmark-heart" }), /* @__PURE__ */ React.createElement("span", null, "Tour y\xEAu th\xEDch"))), /* @__PURE__ */ React.createElement("div", { className: "d-grid gap-2 mt-4" }, !isAuthenticated ? /* @__PURE__ */ React.createElement(Link, { to: "/login", className: "btn btn-primary rounded-pill py-3 fw-bold", "data-bs-dismiss": "offcanvas" }, "\u0110\u0103ng nh\u1EADp \u0111\u1EC3 \u0111\u1EB7t tour") : /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-danger rounded-pill py-3 fw-bold w-100", onClick: logout }, "\u0110\u0103ng xu\u1EA5t")))), /* @__PURE__ */ React.createElement("div", { className: `nav-search-dropdown${searchOpen ? " show" : ""}`, id: "navSearchPanel", "aria-hidden": !searchOpen }, /* @__PURE__ */ React.createElement("div", { className: "nav-search-dropdown-inner" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "fw-bold search-dropdown-title" }, "T\xECm tour"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-close nav-search-close", "aria-label": "\u0110\xF3ng", onClick: () => setSearchOpen(false) })), /* @__PURE__ */ React.createElement("form", { className: "search-card search-card--nav", onSubmit: navSearch, autoComplete: "off" }, /* @__PURE__ */ React.createElement("div", { className: "row g-3 align-items-end" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement("label", { className: "search-field-label" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-geo-alt-fill" }), " B\u1EA1n mu\u1ED1n \u0111i \u0111\xE2u?"), /* @__PURE__ */ React.createElement("input", { className: "form-control search-field-input", name: "diemDen", placeholder: "v\xED d\u1EE5: \u0110\xE0 N\u1EB5ng..." })), /* @__PURE__ */ React.createElement("div", { className: "col-md-3" }, /* @__PURE__ */ React.createElement("label", { className: "search-field-label" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-calendar-event-fill" }), " Ng\xE0y \u0111i"), /* @__PURE__ */ React.createElement("input", { className: "form-control search-field-input zaki-date", name: "ngayDi", placeholder: "dd/mm/yyyy" })), /* @__PURE__ */ React.createElement("div", { className: "col-md-3" }, /* @__PURE__ */ React.createElement("label", { className: "search-field-label" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-tag-fill" }), " Kho\u1EA3ng gi\xE1"), /* @__PURE__ */ React.createElement("select", { className: "form-select search-field-input search-field-select", name: "khoangGia", defaultValue: "" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "T\u1EA5t c\u1EA3 m\u1EE9c gi\xE1"), /* @__PURE__ */ React.createElement("option", { value: "DUOI5" }, "D\u01B0\u1EDBi 5 tri\u1EC7u"), /* @__PURE__ */ React.createElement("option", { value: "5_10" }, "5 - 10 tri\u1EC7u"), /* @__PURE__ */ React.createElement("option", { value: "TREN10" }, "Tr\xEAn 10 tri\u1EC7u"))), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary w-100 py-3 fw-bold" }, "T\xCCM KI\u1EBEM")))))), /* @__PURE__ */ React.createElement("div", { className: `nav-search-scrim${searchOpen ? " show" : ""}`, onClick: () => setSearchOpen(false), "aria-hidden": true }), /* @__PURE__ */ React.createElement("main", { className: "pt-5 mt-4" }, /* @__PURE__ */ React.createElement(Outlet, null)), /* @__PURE__ */ React.createElement("section", { className: "newsletter" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("h3", null, "\u0110\u0103ng k\xFD nh\u1EADn tin khuy\u1EBFn m\xE3i"), /* @__PURE__ */ React.createElement("p", null, "Nh\u1EADn ngay \u01B0u \u0111\xE3i du l\u1ECBch m\u1EDBi nh\u1EA5t m\u1ED7i tu\u1EA7n t\u1EEB ZakiBooking"), /* @__PURE__ */ React.createElement(
    "form",
    {
      className: "d-flex justify-content-center mt-3 mx-auto",
      style: { maxWidth: 600 },
      onSubmit: (e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email");
        navigate(`/register?email=${encodeURIComponent(String(email ?? ""))}`);
      }
    },
    /* @__PURE__ */ React.createElement("input", { type: "email", name: "email", className: "form-control", placeholder: "Nh\u1EADp email c\u1EE7a b\u1EA1n...", required: true }),
    /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary ms-2" }, "\u0110\u0103ng k\xFD")
  ))), /* @__PURE__ */ React.createElement("footer", { className: "bg-dark text-white py-4" }, /* @__PURE__ */ React.createElement("div", { className: "container text-center" }, /* @__PURE__ */ React.createElement("p", { className: "mb-1" }, "\xA9 2025 ZakiBooking"), /* @__PURE__ */ React.createElement("p", null, "Email: minhd4360@gmail.com | Hotline: +84 866147595"))), /* @__PURE__ */ React.createElement(Chatbot, null));
}
export {
  ZakiLayout
};
