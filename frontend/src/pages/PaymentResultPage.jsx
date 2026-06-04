import { Link, useSearchParams } from "react-router-dom";
import { formatVnd } from "../utils/format";
function PaymentResultPage() {
  const [params] = useSearchParams();
  const code = params.get("vnp_ResponseCode") ?? params.get("RspCode");
  const success = code === "00";
  const amount = params.get("vnp_Amount");
  const txn = params.get("vnp_TxnRef");
  return /* @__PURE__ */ React.createElement("div", { className: "container py-5", style: { marginTop: 60, maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { className: `card border-0 shadow-sm rounded-4 p-4 text-center ${success ? "border-success" : "border-danger"}` }, /* @__PURE__ */ React.createElement("div", { className: `display-4 mb-3 ${success ? "text-success" : "text-danger"}` }, /* @__PURE__ */ React.createElement("i", { className: `bi ${success ? "bi-check-circle-fill" : "bi-x-circle-fill"}` })), /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-2" }, success ? "Thanh to\xE1n th\xE0nh c\xF4ng" : "Thanh to\xE1n th\u1EA5t b\u1EA1i"), /* @__PURE__ */ React.createElement("p", { className: "text-muted mb-3" }, success ? "\u0110\u01A1n \u0111\u1EB7t tour c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn. Ki\u1EC3m tra email v\xE0 m\u1EE5c \u0110\u1EB7t ch\u1ED7 c\u1EE7a t\xF4i." : "Giao d\u1ECBch ch\u01B0a ho\xE0n t\u1EA5t. B\u1EA1n c\xF3 th\u1EC3 th\u1EED thanh to\xE1n l\u1EA1i t\u1EEB danh s\xE1ch \u0111\u1EB7t ch\u1ED7."), amount && /* @__PURE__ */ React.createElement("p", { className: "fw-bold" }, "S\u1ED1 ti\u1EC1n: ", formatVnd(Number(amount) / 100)), txn && /* @__PURE__ */ React.createElement("p", { className: "small text-muted" }, "M\xE3 giao d\u1ECBch: ", txn), /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-2 justify-content-center mt-4" }, /* @__PURE__ */ React.createElement(Link, { to: "/user/bookings", className: "btn btn-primary" }, "\u0110\u1EB7t ch\u1ED7 c\u1EE7a t\xF4i"), /* @__PURE__ */ React.createElement(Link, { to: "/", className: "btn btn-outline-secondary" }, "V\u1EC1 trang ch\u1EE7"))));
}
export {
  PaymentResultPage
};
