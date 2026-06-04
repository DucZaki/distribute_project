import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { AuthLogo, AuthShell } from "../components/auth/AuthShell";
import { PasswordInput } from "../components/auth/PasswordInput";
function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loginSession } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const prefEmail = params.get("email") ?? "";
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirmPassword")) {
      setError("M\u1EADt kh\u1EA9u x\xE1c nh\u1EADn kh\xF4ng kh\u1EDBp.");
      return;
    }
    if (!fd.get("terms")) {
      setError("Vui l\xF2ng \u0111\u1ED3ng \xFD \u0111i\u1EC1u kho\u1EA3n d\u1ECBch v\u1EE5.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        tenDangNhap: String(fd.get("tenDangNhap")),
        hoTen: String(fd.get("hoTen")),
        number: String(fd.get("number") ?? "")
      });
      const d = res.data;
      loginSession(d.accessToken, d.refreshToken, d.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kh\xF4ng th\u1EC3 \u0111\u0103ng k\xFD. Vui l\xF2ng th\u1EED l\u1EA1i.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ React.createElement(
    AuthShell,
    {
      layout: "register",
      heroOverlay: "caption",
      heroTitle: "Kh\xE1m ph\xE1 nh\u1EEFng \u0111i\u1EC3m \u0111\u1EBFn tuy\u1EC7t v\u1EDDi",
      heroSubtitle: "H\xE0ng ngh\xECn tour du l\u1ECBch \u0111ang ch\u1EDD b\u1EA1n kh\xE1m ph\xE1",
      footer: /* @__PURE__ */ React.createElement("p", { className: "auth-footer-text" }, "\u0110\xE3 l\xE0 th\xE0nh vi\xEAn? ", /* @__PURE__ */ React.createElement(Link, { to: "/login" }, "\u0110\u0103ng nh\u1EADp ngay"))
    },
    /* @__PURE__ */ React.createElement(AuthLogo, { variant: "register" }),
    /* @__PURE__ */ React.createElement("header", { className: "auth-header" }, /* @__PURE__ */ React.createElement("h1", { className: "auth-title font-heading" }, "T\u1EA1o t\xE0i kho\u1EA3n m\u1EDBi"), /* @__PURE__ */ React.createElement("p", { className: "auth-subtitle" }, "\u0110\u0103ng k\xFD \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u h\xE0nh tr\xECnh kh\xE1m ph\xE1 c\xF9ng ZakiBooking")),
    error && /* @__PURE__ */ React.createElement("div", { className: "auth-alert auth-alert-danger", role: "alert" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-exclamation-circle flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", null, error)),
    /* @__PURE__ */ React.createElement("form", { onSubmit, className: "auth-stack auth-stack--register", autoComplete: "off" }, /* @__PURE__ */ React.createElement("div", { className: "auth-field-row" }, /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-username", className: "auth-label-upper" }, "T\xEAn \u0111\u0103ng nh\u1EADp"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "reg-username",
        name: "tenDangNhap",
        className: "auth-input",
        placeholder: "username",
        required: true,
        minLength: 3,
        autoComplete: "username"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-name", className: "auth-label-upper" }, "H\u1ECD v\xE0 t\xEAn"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "reg-name",
        name: "hoTen",
        className: "auth-input",
        placeholder: "Nguy\u1EC5n V\u0103n A",
        required: true,
        autoComplete: "name"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "auth-field-row" }, /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-phone", className: "auth-label-upper" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "reg-phone",
        name: "number",
        type: "tel",
        className: "auth-input",
        placeholder: "0901234567",
        autoComplete: "tel"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-email", className: "auth-label-upper" }, "Email"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "reg-email",
        name: "email",
        type: "email",
        className: "auth-input",
        placeholder: "yourname@gmail.com",
        defaultValue: prefEmail,
        required: true,
        autoComplete: "email"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-password", className: "auth-label-upper" }, "M\u1EADt kh\u1EA9u"), /* @__PURE__ */ React.createElement(
      PasswordInput,
      {
        id: "reg-password",
        name: "password",
        className: "auth-input",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        required: true,
        minLength: 6,
        autoComplete: "new-password"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "auth-field" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "reg-confirm", className: "auth-label-upper" }, "X\xE1c nh\u1EADn m\u1EADt kh\u1EA9u"), /* @__PURE__ */ React.createElement(
      PasswordInput,
      {
        id: "reg-confirm",
        name: "confirmPassword",
        className: "auth-input",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        required: true,
        minLength: 6,
        autoComplete: "new-password"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "auth-check" }, /* @__PURE__ */ React.createElement("input", { id: "terms", name: "terms", type: "checkbox", value: "1", required: true }), /* @__PURE__ */ React.createElement("label", { htmlFor: "terms" }, "T\xF4i \u0111\u1ED3ng \xFD v\u1EDBi ", /* @__PURE__ */ React.createElement(Link, { to: "/contact" }, "\u0110i\u1EC1u kho\u1EA3n d\u1ECBch v\u1EE5"), " v\xE0", " ", /* @__PURE__ */ React.createElement(Link, { to: "/contact" }, "Ch\xEDnh s\xE1ch b\u1EA3o m\u1EADt"))), /* @__PURE__ */ React.createElement("div", { className: "auth-actions" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "auth-btn-primary", disabled: loading }, loading ? "\u0110ang x\u1EED l\xFD..." : "B\u1EAFt \u0111\u1EA7u h\xE0nh tr\xECnh ngay")))
  );
}
export {
  RegisterPage
};
