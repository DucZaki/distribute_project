import { useState } from "react";
function PasswordInput({ id, className = "", ...rest }) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ React.createElement("div", { className: "auth-input-wrap" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      id,
      type: visible ? "text" : "password",
      className: `auth-input ${className}`.trim(),
      ...rest
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "auth-toggle-pw",
      "aria-label": visible ? "\u1EA8n m\u1EADt kh\u1EA9u" : "Hi\u1EC7n m\u1EADt kh\u1EA9u",
      onClick: () => setVisible((v) => !v)
    },
    /* @__PURE__ */ React.createElement("i", { className: `bi ${visible ? "bi-eye-slash" : "bi-eye"}` })
  ));
}
export {
  PasswordInput
};
