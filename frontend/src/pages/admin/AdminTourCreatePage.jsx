import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { createAdminTour } from "../../api/adminTours";
function AdminTourCreatePage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    tieuDe: "",
    moTa: "",
    gia: "",
    idDiemDen: "",
    hinhAnh: "/anh/anh/diemden/hanoi.jpg",
    ngayKhoiHanh: "",
    ngayKetThuc: "",
    noiBat: false
  });
  useEffect(() => {
    apiFetch("/tours/destinations", {}, false).then((r) => setDestinations(r.data ?? [])).catch(() => setDestinations([]));
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const r = await createAdminTour({
        tieuDe: form.tieuDe,
        moTa: form.moTa,
        gia: Number(form.gia),
        idDiemDen: Number(form.idDiemDen),
        hinhAnh: form.hinhAnh,
        ngayKhoiHanh: form.ngayKhoiHanh || null,
        ngayKetThuc: form.ngayKetThuc || null,
        noiBat: form.noiBat,
        lichTrinhs: []
      });
      navigate(`/admin/tour/detail/${r.data.id}`);
    } catch (err) {
      setError(err.message ?? "L\u1ED7i t\u1EA1o tour");
    }
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0", style: { maxWidth: 720 } }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between mb-4" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, "T\u1EA1o chuy\u1EBFn \u0111i m\u1EDBi"), /* @__PURE__ */ React.createElement(Link, { to: "/admin/tour/active", className: "btn btn-outline-secondary btn-sm" }, "Quay l\u1EA1i")), error && /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, error), /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ti\xEAu \u0111\u1EC1"), /* @__PURE__ */ React.createElement("input", { className: "form-control", required: true, value: form.tieuDe, onChange: (e) => setForm({ ...form, tieuDe: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "M\xF4 t\u1EA3"), /* @__PURE__ */ React.createElement("textarea", { className: "form-control", rows: 4, value: form.moTa, onChange: (e) => setForm({ ...form, moTa: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Gi\xE1 (VND)"), /* @__PURE__ */ React.createElement("input", { className: "form-control", type: "number", required: true, value: form.gia, onChange: (e) => setForm({ ...form, gia: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "\u0110i\u1EC3m \u0111\u1EBFn"), /* @__PURE__ */ React.createElement("select", { className: "form-select", required: true, value: form.idDiemDen, onChange: (e) => setForm({ ...form, idDiemDen: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Ch\u1ECDn \u0111i\u1EC3m \u0111\u1EBFn"), destinations.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id, value: d.id }, d.ten)))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "\u1EA2nh (URL)"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: form.hinhAnh, onChange: (e) => setForm({ ...form, hinhAnh: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "row g-3 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y b\u1EAFt \u0111\u1EA7u"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "form-control", value: form.ngayKhoiHanh, onChange: (e) => setForm({ ...form, ngayKhoiHanh: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y k\u1EBFt th\xFAc"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "form-control", value: form.ngayKetThuc, onChange: (e) => setForm({ ...form, ngayKetThuc: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "form-check mb-3" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", checked: form.noiBat, onChange: (e) => setForm({ ...form, noiBat: e.target.checked }) }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Tour n\u1ED5i b\u1EADt")), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "T\u1EA1o tour")));
}
export {
  AdminTourCreatePage
};
