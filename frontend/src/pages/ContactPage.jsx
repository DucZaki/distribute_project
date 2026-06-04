import { useState } from "react";
import { submitContact } from "../api/reviews";
import { ApiError } from "../api/client";
function ContactPage() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      await submitContact({
        hoTen: String(fd.get("hoTen")),
        email: String(fd.get("email")),
        noiDung: String(fd.get("noiDung")),
        tieuDe: "Li\xEAn h\u1EC7 t\u1EEB website"
      });
      setMsg("\u0110\xE3 g\u1EEDi li\xEAn h\u1EC7 th\xE0nh c\xF4ng. Ch\xFAng t\xF4i s\u1EBD ph\u1EA3n h\u1ED3i s\u1EDBm.");
      e.currentTarget.reset();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "G\u1EEDi th\u1EA5t b\u1EA1i");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container contact-page py-5" }, /* @__PURE__ */ React.createElement("div", { className: "row justify-content-center" }, /* @__PURE__ */ React.createElement("div", { className: "col-lg-8" }, /* @__PURE__ */ React.createElement("h1", { className: "fw-bold mb-2" }, "Li\xEAn h\u1EC7 v\u1EDBi ch\xFAng t\xF4i"), /* @__PURE__ */ React.createElement("p", { className: "text-muted mb-4" }, "Ch\xFAng t\xF4i lu\xF4n s\u1EB5n s\xE0ng h\u1ED7 tr\u1EE3 b\u1EA1n 24/7"), msg && /* @__PURE__ */ React.createElement("div", { className: "alert alert-success" }, msg), err && /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, err), /* @__PURE__ */ React.createElement("form", { onSubmit, className: "card border-0 shadow-sm p-4" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "H\u1ECD t\xEAn"), /* @__PURE__ */ React.createElement("input", { name: "hoTen", className: "form-control", required: true })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Email"), /* @__PURE__ */ React.createElement("input", { name: "email", type: "email", className: "form-control", required: true })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "N\u1ED9i dung"), /* @__PURE__ */ React.createElement("textarea", { name: "noiDung", className: "form-control", rows: 5, required: true })), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary px-4" }, "G\u1EEDi li\xEAn h\u1EC7")))));
}
export {
  ContactPage
};
