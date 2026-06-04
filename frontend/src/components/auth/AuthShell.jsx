import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AUTH_HERO_IMAGE } from "./authHero";
function AuthShell({
  layout,
  children,
  footer,
  heroTitle,
  heroSubtitle,
  heroOverlay = "card"
}) {
  useEffect(() => {
    document.body.classList.add("auth-route");
    const prevTheme = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "dark");
    return () => {
      document.body.classList.remove("auth-route");
      if (prevTheme) document.documentElement.setAttribute("data-theme", prevTheme);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: `auth-page auth-page--${layout}` }, /* @__PURE__ */ React.createElement("div", { className: "auth-form-panel" }, /* @__PURE__ */ React.createElement("div", { className: "auth-form-inner" }, children, footer)), /* @__PURE__ */ React.createElement("div", { className: "auth-hero-panel" }, /* @__PURE__ */ React.createElement("div", { className: "auth-hero-overlay", "aria-hidden": true }), /* @__PURE__ */ React.createElement("img", { src: AUTH_HERO_IMAGE, alt: "", className: "auth-hero-img" }), heroTitle && (heroOverlay === "card" ? /* @__PURE__ */ React.createElement("div", { className: "auth-hero-card font-heading" }, /* @__PURE__ */ React.createElement("h3", null, heroTitle), heroSubtitle && /* @__PURE__ */ React.createElement("p", null, heroSubtitle)) : /* @__PURE__ */ React.createElement("div", { className: "auth-hero-caption font-heading" }, /* @__PURE__ */ React.createElement("h3", null, heroTitle), heroSubtitle && /* @__PURE__ */ React.createElement("p", null, heroSubtitle)))));
}
function AuthLogo({ variant }) {
  if (variant === "register") {
    return /* @__PURE__ */ React.createElement("div", { className: "auth-logo-block auth-logo-block--register" }, /* @__PURE__ */ React.createElement(Link, { to: "/" }, /* @__PURE__ */ React.createElement("img", { src: "/favicon.icon", alt: "Logo", onError: (e) => {
      e.target.style.display = "none";
    } })));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "auth-logo-block" }, /* @__PURE__ */ React.createElement(Link, { to: "/", className: "auth-logo-link" }, /* @__PURE__ */ React.createElement("img", { src: "/favicon.icon", alt: "Logo", onError: (e) => {
    e.target.style.display = "none";
  } })));
}
export {
  AuthLogo,
  AuthShell
};
