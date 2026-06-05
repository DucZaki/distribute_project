import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPromo, listPromos, updatePromo } from "../../api/adminPromos";
function AdminPromoFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ma: "",
    moTa: "",
    loai: "PERCENT",
    giaTri: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    soLanDungToiDa: "",
    active: true,
  });
  useEffect(() => {
    if (!isEdit) return;
    listPromos(0, 200)
      .then((r) => {
        const p = (r.data.content ?? []).find((x) => x.id === Number(id));
        if (!p) return;
        setForm({
          ma: p.ma,
          moTa: p.moTa ?? "",
          loai: p.loai,
          giaTri: String(p.giaTri),
          ngayBatDau: p.ngayBatDau ?? "",
          ngayKetThuc: p.ngayKetThuc ?? "",
          soLanDungToiDa:
            p.soLanDungToiDa != null ? String(p.soLanDungToiDa) : "",
          active: p.active !== false,
        });
      })
      .catch(() => {});
  }, [id, isEdit]);
  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      ma: form.ma,
      moTa: form.moTa,
      loai: form.loai,
      giaTri: Number(form.giaTri),
      ngayBatDau: form.ngayBatDau || null,
      ngayKetThuc: form.ngayKetThuc || null,
      soLanDungToiDa: form.soLanDungToiDa ? Number(form.soLanDungToiDa) : null,
      active: form.active,
    };
    try {
      if (isEdit) await updatePromo(Number(id), body);
      else await createPromo(body);
      navigate("/admin/promo");
    } catch (err) {
      setError(err.message ?? "L\u1ED7i");
    }
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: "container-fluid px-0", style: { maxWidth: 640 } },
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "d-flex justify-content-between mb-4" },
      /* @__PURE__ */ React.createElement(
        "h2",
        { className: "fw-bold mb-0" },
        isEdit
          ? "S\u1EEDa m\xE3 gi\u1EA3m gi\xE1"
          : "Th\xEAm m\xE3 gi\u1EA3m gi\xE1",
      ),
      /* @__PURE__ */ React.createElement(
        Link,
        { to: "/admin/promo", className: "btn btn-outline-secondary btn-sm" },
        "Quay l\u1EA1i",
      ),
    ),
    error &&
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "alert alert-danger" },
        error,
      ),
    /* @__PURE__ */ React.createElement(
      "form",
      { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-3" },
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-label" },
          "M\xE3",
        ),
        /* @__PURE__ */ React.createElement("input", {
          className: "form-control",
          required: true,
          value: form.ma,
          onChange: (e) => setForm({ ...form, ma: e.target.value }),
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-3" },
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-label" },
          "M\xF4 t\u1EA3",
        ),
        /* @__PURE__ */ React.createElement("input", {
          className: "form-control",
          value: form.moTa,
          onChange: (e) => setForm({ ...form, moTa: e.target.value }),
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-3" },
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-label" },
          "Lo\u1EA1i",
        ),
        /* @__PURE__ */ React.createElement(
          "select",
          {
            className: "form-select",
            value: form.loai,
            onChange: (e) => setForm({ ...form, loai: e.target.value }),
          },
          /* @__PURE__ */ React.createElement(
            "option",
            { value: "PERCENT" },
            "Ph\u1EA7n tr\u0103m (%)",
          ),
          /* @__PURE__ */ React.createElement(
            "option",
            { value: "AMOUNT" },
            "S\u1ED1 ti\u1EC1n (VND)",
          ),
        ),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-3" },
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-label" },
          "Gi\xE1 tr\u1ECB",
        ),
        /* @__PURE__ */ React.createElement("input", {
          type: "number",
          className: "form-control",
          required: true,
          value: form.giaTri,
          onChange: (e) => setForm({ ...form, giaTri: e.target.value }),
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "row g-3 mb-3" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "col-md-6" },
          /* @__PURE__ */ React.createElement(
            "label",
            { className: "form-label" },
            "B\u1EAFt \u0111\u1EA7u",
          ),
          /* @__PURE__ */ React.createElement("input", {
            type: "date",
            className: "form-control",
            value: form.ngayBatDau,
            onChange: (e) => setForm({ ...form, ngayBatDau: e.target.value }),
          }),
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "col-md-6" },
          /* @__PURE__ */ React.createElement(
            "label",
            { className: "form-label" },
            "K\u1EBFt th\xFAc",
          ),
          /* @__PURE__ */ React.createElement("input", {
            type: "date",
            className: "form-control",
            value: form.ngayKetThuc,
            onChange: (e) => setForm({ ...form, ngayKetThuc: e.target.value }),
          }),
        ),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "mb-3" },
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-label" },
          "S\u1ED1 l\u1EA7n d\xF9ng t\u1ED1i \u0111a",
        ),
        /* @__PURE__ */ React.createElement("input", {
          type: "number",
          className: "form-control",
          value: form.soLanDungToiDa,
          onChange: (e) => setForm({ ...form, soLanDungToiDa: e.target.value }),
        }),
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "form-check mb-3" },
        /* @__PURE__ */ React.createElement("input", {
          className: "form-check-input",
          type: "checkbox",
          checked: form.active,
          onChange: (e) => setForm({ ...form, active: e.target.checked }),
        }),
        /* @__PURE__ */ React.createElement(
          "label",
          { className: "form-check-label" },
          "Active",
        ),
      ),
      /* @__PURE__ */ React.createElement(
        "button",
        { type: "submit", className: "btn btn-primary" },
        "L\u01B0u",
      ),
    ),
  );
}
export { AdminPromoFormPage };
