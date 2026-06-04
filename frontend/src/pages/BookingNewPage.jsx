import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { applyPromo, createBooking, initVnPay } from "../api/bookings";
import { fetchFlightQuote, getTour } from "../api/tours";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { formatVnd } from "../utils/format";
function BookingNewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const nkhId = Number(searchParams.get("nkhId"));
  const tourId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [diemDonId, setDiemDonId] = useState(0);
  const [quote, setQuote] = useState(null);
  const [soLuong, setSoLuong] = useState(1);
  const [maGiamGia, setMaGiamGia] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const diemDonOptions = useMemo(() => {
    const list = tour?.diemDons?.length ? [...tour.diemDons] : tour?.diemDon ? [tour.diemDon] : [];
    return list;
  }, [tour]);
  useEffect(() => {
    if (!tourId) return;
    getTour(tourId).then((r) => {
      setTour(r.data);
      const fromUrl = Number(searchParams.get("diemDonId"));
      const first = r.data.diemDons?.[0]?.id ?? r.data.diemDon?.id;
      setDiemDonId(fromUrl || first || 0);
    }).catch(() => setTour(null));
  }, [tourId, searchParams]);
  useEffect(() => {
    if (!tourId || !nkhId || !diemDonId) return;
    fetchFlightQuote(tourId, nkhId, diemDonId, false).then((r) => setQuote(r.data)).catch(() => setQuote(null));
  }, [tourId, nkhId, diemDonId]);
  const unitPrice = quote?.available && quote.unitPrice != null ? quote.unitPrice : tour?.gia ?? 0;
  const subtotal = unitPrice * soLuong;
  const total = Math.max(subtotal - discount, 0);
  async function validatePromo() {
    if (!maGiamGia) return;
    try {
      const res = await applyPromo(maGiamGia, subtotal);
      if (res.data.valid) {
        setDiscount(res.data.discount ?? 0);
        setPromoMsg(res.data.message ?? "\xC1p d\u1EE5ng m\xE3 th\xE0nh c\xF4ng");
      } else {
        setDiscount(0);
        setPromoMsg(res.data.message ?? "M\xE3 kh\xF4ng h\u1EE3p l\u1EC7");
      }
    } catch {
      setPromoMsg("Kh\xF4ng ki\u1EC3m tra \u0111\u01B0\u1EE3c m\xE3 gi\u1EA3m gi\xE1");
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    if (!tourId || !nkhId || !diemDonId) return;
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createBooking({
        idChuyenDi: tourId,
        idNgayKhoiHanh: nkhId,
        idDiemDon: diemDonId,
        soLuong: Number(fd.get("soLuong")),
        hoTen: String(fd.get("hoTen")),
        email: String(fd.get("email")),
        soDienThoai: String(fd.get("soDienThoai")),
        maGiamGia: maGiamGia || void 0,
        ghiChu: String(fd.get("ghiChu") ?? "") || void 0
      });
      const booking = res.data;
      try {
        const pay = await initVnPay(booking.id, booking.tongGia);
        if (pay.data.redirectUrl) {
          window.location.href = pay.data.redirectUrl;
          return;
        }
      } catch {
        setError("VNPay ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh (VNP_TMN_CODE / VNP_HASH_SECRET).");
      }
      navigate("/user/bookings");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kh\xF4ng th\u1EC3 \u0111\u1EB7t tour");
    } finally {
      setLoading(false);
    }
  }
  if (!tourId || !nkhId) {
    return /* @__PURE__ */ React.createElement("div", { className: "container pt-5" }, /* @__PURE__ */ React.createElement("div", { className: "alert alert-warning" }, "Thi\u1EBFu th\xF4ng tin tour ho\u1EB7c ng\xE0y kh\u1EDFi h\xE0nh."));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "container pt-5", style: { marginTop: 30 } }, /* @__PURE__ */ React.createElement("nav", { "aria-label": "breadcrumb", className: "mb-3" }, /* @__PURE__ */ React.createElement("ol", { className: "breadcrumb small" }, /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement(Link, { to: "/" }, "Trang ch\u1EE7")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement(Link, { to: "/tour" }, "Tour")), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item" }, /* @__PURE__ */ React.createElement(Link, { to: `/tour/${tourId}` }, tour?.tieuDe)), /* @__PURE__ */ React.createElement("li", { className: "breadcrumb-item active" }, "\u0110\u1EB7t tour"))), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-lg-8" }, /* @__PURE__ */ React.createElement("div", { className: "card shadow-sm border-0 mb-4 booking-card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header booking-card-header" }, /* @__PURE__ */ React.createElement("div", { className: "booking-card-title" }, "Th\xF4ng tin li\xEAn l\u1EA1c")), /* @__PURE__ */ React.createElement("div", { className: "card-body p-4 booking-form" }, error && /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger" }, error), /* @__PURE__ */ React.createElement("form", { onSubmit, id: "bookingForm" }, /* @__PURE__ */ React.createElement("div", { className: "row g-3" }, diemDonOptions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "\u0110i\u1EC3m \u0111\xF3n *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: diemDonId,
      onChange: (e) => setDiemDonId(Number(e.target.value)),
      required: true
    },
    diemDonOptions.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id, value: d.id }, d.ten))
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "H\u1ECD v\xE0 t\xEAn *"), /* @__PURE__ */ React.createElement("input", { name: "hoTen", className: "form-control", defaultValue: user?.hoTen ?? "", required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Email *"), /* @__PURE__ */ React.createElement("input", { name: "email", type: "email", className: "form-control", defaultValue: user?.email ?? "", required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i *"), /* @__PURE__ */ React.createElement("input", { name: "soDienThoai", className: "form-control", required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "S\u1ED1 l\u01B0\u1EE3ng kh\xE1ch *"), /* @__PURE__ */ React.createElement("input", { name: "soLuong", type: "number", min: 1, max: 20, className: "form-control", value: soLuong, onChange: (e) => setSoLuong(Number(e.target.value)), required: true })), /* @__PURE__ */ React.createElement("div", { className: "col-md-12" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ghi ch\xFA"), /* @__PURE__ */ React.createElement("textarea", { name: "ghiChu", className: "form-control", rows: 3 })), /* @__PURE__ */ React.createElement("div", { className: "col-md-8" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "M\xE3 gi\u1EA3m gi\xE1"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: maGiamGia, onChange: (e) => setMaGiamGia(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "col-md-4 d-flex align-items-end" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-primary w-100", onClick: validatePromo }, "\xC1p d\u1EE5ng")), promoMsg && /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, promoMsg)), /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary fw-bold px-5", disabled: loading }, loading ? "\u0110ang x\u1EED l\xFD..." : "Thanh to\xE1n VNPay"))))))), /* @__PURE__ */ React.createElement("div", { className: "col-lg-4" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold" }, tour?.tieuDe), quote?.available && /* @__PURE__ */ React.createElement("div", { className: "small text-muted mb-2" }, /* @__PURE__ */ React.createElement("div", null, "V\xE9 m\xE1y bay: ", formatVnd(Number(quote.tongGiaVe ?? 0))), /* @__PURE__ */ React.createElement("div", null, "Chuy\u1EBFn \u0111i: ", quote.maChuyenBayDi, " \xB7 ", quote.gioBayDi), /* @__PURE__ */ React.createElement("div", null, "Ng\xE0y: ", quote.ngayDi, " \u2192 ", quote.ngayVe || "\u2014")), /* @__PURE__ */ React.createElement("hr", null), /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between" }, /* @__PURE__ */ React.createElement("span", null, "\u0110\u01A1n gi\xE1 \xD7 ", soLuong), /* @__PURE__ */ React.createElement("span", null, formatVnd(unitPrice * soLuong))), discount > 0 && /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between text-success" }, /* @__PURE__ */ React.createElement("span", null, "Gi\u1EA3m gi\xE1"), /* @__PURE__ */ React.createElement("span", null, "-", formatVnd(discount))), /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between fw-bold fs-5 mt-2" }, /* @__PURE__ */ React.createElement("span", null, "T\u1ED5ng"), /* @__PURE__ */ React.createElement("span", { className: "text-danger" }, formatVnd(total))))))));
}
export {
  BookingNewPage
};
