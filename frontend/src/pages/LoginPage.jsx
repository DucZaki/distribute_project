import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { resolvePostLoginPath } from "../auth/redirectAfterAuth";
import { AuthLogo, AuthShell } from "../components/auth/AuthShell";
import { PasswordInput } from "../components/auth/PasswordInput";
function GoogleIcon() {
  return /* @__PURE__ */ React.createElement(
    "svg",
    { viewBox: "0 0 24 24", "aria-hidden": true },
    /* @__PURE__ */ React.createElement("path", {
      fill: "currentColor",
      d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
    }),
    /* @__PURE__ */ React.createElement("path", {
      fill: "currentColor",
      d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
    }),
    /* @__PURE__ */ React.createElement("path", {
      fill: "currentColor",
      d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
    }),
    /* @__PURE__ */ React.createElement("path", {
      fill: "currentColor",
      d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
    }),
  );
}
function FacebookIcon() {
  return /* @__PURE__ */ React.createElement(
    "svg",
    { viewBox: "0 0 24 24", "aria-hidden": true },
    /* @__PURE__ */ React.createElement("path", {
      fill: "currentColor",
      d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.89h-2.3v6.99C18.34 21.13 22 16.99 22 12z",
    }),
  );
}
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSession } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem("authRemember") === "1",
  );
  const from = location.state?.from ?? "/";
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await login(
        String(fd.get("email")),
        String(fd.get("password")),
      );
      const d = res.data;
      if (remember) localStorage.setItem("authRemember", "1");
      else localStorage.removeItem("authRemember");
      loginSession(d.accessToken, d.refreshToken, d.user);
      navigate(resolvePostLoginPath(d.user, from), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "T\xEAn \u0111\u0103ng nh\u1EADp ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c.",
      );
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ React.createElement(
    AuthShell,
    {
      layout: "login",
      heroOverlay: "card",
      heroTitle: /* @__PURE__ */ React.createElement(
        React.Fragment,
        null,
        "Kh\xE1m ph\xE1 th\u1EBF gi\u1EDBi, ",
        /* @__PURE__ */ React.createElement("br", null),
        /* @__PURE__ */ React.createElement(
          "span",
          { className: "auth-brand-gradient" },
          "Ki\u1EBFn t\u1EA1o h\xE0nh tr\xECnh.",
        ),
      ),
      heroSubtitle:
        "Tr\u1EA3i nghi\u1EC7m nh\u1EEFng d\u1ECBch v\u1EE5 du l\u1ECBch h\xE0ng \u0111\u1EA7u v\u1EDBi ZakiBooking.",
      footer: /* @__PURE__ */ React.createElement(
        "p",
        { className: "auth-footer-text" },
        "Ch\u01B0a c\xF3 t\xE0i kho\u1EA3n? ",
        /* @__PURE__ */ React.createElement(
          Link,
          { to: "/register" },
          "Tham gia ngay",
        ),
      ),
    },
    /* @__PURE__ */ React.createElement(AuthLogo, { variant: "login" }),
    /* @__PURE__ */ React.createElement(
      "header",
      { className: "auth-header" },
      /* @__PURE__ */ React.createElement(
        "h1",
        { className: "auth-title font-heading" },
        "Ch\xE0o m\u1EEBng ",
        /* @__PURE__ */ React.createElement(
          "span",
          { className: "auth-brand-gradient" },
          "tr\u1EDF l\u1EA1i!",
        ),
      ),
    ),
    error &&
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-alert auth-alert-danger", role: "alert" },
        /* @__PURE__ */ React.createElement("i", {
          className: "bi bi-exclamation-circle flex-shrink-0",
        }),
        /* @__PURE__ */ React.createElement("span", null, error),
      ),
    /* @__PURE__ */ React.createElement(
      "form",
      { onSubmit, className: "auth-stack", autoComplete: "off" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-field" },
        /* @__PURE__ */ React.createElement(
          "label",
          { htmlFor: "login-email" },
          "T\xEAn \u0111\u0103ng nh\u1EADp / Email",
        ),
        /* @__PURE__ */ React.createElement("input", {
          id: "login-email",
          name: "email",
          type: "text",
          className: "auth-input",
          placeholder: "admin hoặc admin@bookingtour.com",
          required: true,
          autoComplete: "username",
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-field" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "auth-row-link" },
          /* @__PURE__ */ React.createElement(
            "label",
            { htmlFor: "login-password" },
            "M\u1EADt kh\u1EA9u",
          ),
          /* @__PURE__ */ React.createElement(
            "a",
            {
              href: "#forgot",
              className: "auth-forgot",
              onClick: (e) => e.preventDefault(),
              title: "S\u1EAFp c\xF3",
            },
            "Qu\xEAn m\u1EADt kh\u1EA9u?",
          ),
        ),
        /* @__PURE__ */ React.createElement(PasswordInput, {
          id: "login-password",
          name: "password",
          className: "auth-input",
          placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
          required: true,
          autoComplete: "current-password",
          minLength: 6,
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-check" },
        /* @__PURE__ */ React.createElement("input", {
          id: "remember-me",
          type: "checkbox",
          checked: remember,
          onChange: (e) => setRemember(e.target.checked),
        }),
        /* @__PURE__ */ React.createElement(
          "label",
          { htmlFor: "remember-me" },
          "Duy tr\xEC \u0111\u0103ng nh\u1EADp",
        ),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-actions" },
        /* @__PURE__ */ React.createElement(
          "button",
          { type: "submit", className: "auth-btn-primary", disabled: loading },
          loading
            ? "\u0110ang \u0111\u0103ng nh\u1EADp..."
            : "\u0110\u0103ng nh\u1EADp",
        ),
        /* @__PURE__ */ React.createElement(
          Link,
          { to: "/", className: "auth-btn-ghost" },
          "Ti\u1EBFp t\u1EE5c v\u1EDBi t\u01B0 c\xE1ch kh\xE1ch",
        ),
      ),
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "auth-below-form" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-divider auth-divider--lowercase" },
        /* @__PURE__ */ React.createElement(
          "span",
          null,
          "ho\u1EB7c \u0111\u0103ng nh\u1EADp b\u1EB1ng",
        ),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "auth-social-grid" },
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "/oauth2/authorization/google",
            className: "auth-social-btn",
            title: "\u0110\u0103ng nh\u1EADp Google",
          },
          /* @__PURE__ */ React.createElement(GoogleIcon, null),
          /* @__PURE__ */ React.createElement("span", null, "Google"),
        ),
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "/oauth2/authorization/facebook",
            className: "auth-social-btn",
            title: "\u0110\u0103ng nh\u1EADp Facebook",
          },
          /* @__PURE__ */ React.createElement(FacebookIcon, null),
          /* @__PURE__ */ React.createElement("span", null, "Facebook"),
        ),
      ),
    ),
  );
}
export { LoginPage };
