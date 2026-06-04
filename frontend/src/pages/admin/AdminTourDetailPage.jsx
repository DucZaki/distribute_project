import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  createTourSchedule,
  deleteAdminTour,
  deleteTourSchedule,
  getAdminTour,
  listTourSchedules,
  toggleTourSchedule,
  updateAdminTour
} from "../../api/adminTours";
import { formatVnd } from "../../utils/format";
function AdminTourDetailPage() {
  const { id } = useParams();
  const tourId = Number(id);
  const [search] = useSearchParams();
  const source = search.get("source") || "active";
  const [tour, setTour] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("info");
  const [scheduleForm, setScheduleForm] = useState({ ngayKhoiHanh: "", ngayKetThuc: "", soChoToiDa: "30", giaOverride: "" });
  const [itineraryForm, setItineraryForm] = useState({ ngayThu: "1", tieuDe: "", hoatDongChinh: "", moTa: "" });
  function reload() {
    getAdminTour(tourId).then((r) => setTour(r.data)).catch(() => setTour(null));
    listTourSchedules(tourId).then((r) => setSchedules(r.data ?? [])).catch(() => setSchedules([]));
  }
  useEffect(() => {
    if (tourId) reload();
  }, [tourId]);
  async function onSaveInfo(e) {
    e.preventDefault();
    if (!tour) return;
    try {
      await updateAdminTour(tourId, {
        tieuDe: tour.tieuDe,
        moTa: tour.moTa,
        gia: tour.gia,
        hinhAnh: tour.hinhAnh,
        highlight: tour.highlight,
        noiBat: tour.noiBat,
        ngayKhoiHanh: tour.ngayKhoiHanh,
        ngayKetThuc: tour.ngayKetThuc
      });
      setMsg("\u0110\xE3 l\u01B0u th\xF4ng tin tour");
      reload();
    } catch (err) {
      setMsg(err.message ?? "L\u1ED7i");
    }
  }
  async function onAddSchedule(e) {
    e.preventDefault();
    try {
      await createTourSchedule(tourId, {
        ngayKhoiHanh: scheduleForm.ngayKhoiHanh,
        ngayKetThuc: scheduleForm.ngayKetThuc || scheduleForm.ngayKhoiHanh,
        soChoToiDa: Number(scheduleForm.soChoToiDa),
        giaOverride: scheduleForm.giaOverride ? Number(scheduleForm.giaOverride) : void 0
      });
      setMsg("\u0110\xE3 th\xEAm l\u1ECBch kh\u1EDFi h\xE0nh");
      reload();
    } catch (err) {
      setMsg(err.message ?? "L\u1ED7i");
    }
  }
  async function onDeleteTour() {
    if (!confirm("X\xF3a tour n\xE0y?")) return;
    await deleteAdminTour(tourId);
    window.location.href = `/admin/tour/${source}`;
  }
  async function onToggleSchedule(scheduleId) {
    if (!scheduleId) return;
    await toggleTourSchedule(tourId, scheduleId);
    setMsg("\u0110\xE3 \u0111\u1ED5i tr\u1EA1ng th\xE1i l\u1ECBch kh\u1EDFi h\xE0nh");
    reload();
  }
  async function saveItineraries(next = tour?.lichTrinhs ?? []) {
    if (!tour) return;
    await updateAdminTour(tourId, {
      tieuDe: tour.tieuDe,
      moTa: tour.moTa,
      gia: tour.gia,
      hinhAnh: tour.hinhAnh,
      highlight: tour.highlight,
      noiBat: tour.noiBat,
      ngayKhoiHanh: tour.ngayKhoiHanh,
      ngayKetThuc: tour.ngayKetThuc,
      lichTrinhs: next
    });
    setMsg("\u0110\xE3 l\u01B0u l\u1ECBch tr\xECnh");
    reload();
  }
  async function onAddItinerary(e) {
    e.preventDefault();
    const next = [
      ...tour?.lichTrinhs ?? [],
      {
        ngayThu: Number(itineraryForm.ngayThu),
        tieuDe: itineraryForm.tieuDe,
        hoatDongChinh: itineraryForm.hoatDongChinh,
        moTa: itineraryForm.moTa
      }
    ].sort((a, b) => Number(a.ngayThu) - Number(b.ngayThu));
    await saveItineraries(next);
    setItineraryForm({ ngayThu: String(next.length + 1), tieuDe: "", hoatDongChinh: "", moTa: "" });
  }
  async function onDeleteItinerary(index) {
    if (!confirm("X\xF3a ng\xE0y l\u1ECBch tr\xECnh n\xE0y?")) return;
    const next = [...tour?.lichTrinhs ?? []];
    next.splice(index, 1);
    await saveItineraries(next);
  }
  async function onDeleteSchedule(scheduleId) {
    if (!scheduleId || !confirm("X\xF3a l\u1ECBch kh\u1EDFi h\xE0nh n\xE0y?")) return;
    await deleteTourSchedule(tourId, scheduleId);
    setMsg("\u0110\xE3 x\xF3a l\u1ECBch kh\u1EDFi h\xE0nh");
    reload();
  }
  if (!tour) return /* @__PURE__ */ React.createElement("div", { className: "text-muted py-5" }, "\u0110ang t\u1EA3i...");
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid px-0" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3" }, /* @__PURE__ */ React.createElement("h2", { className: "fw-bold mb-0" }, tour.tieuDe), /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-2" }, /* @__PURE__ */ React.createElement(Link, { to: `/admin/tour/${source}`, className: "btn btn-outline-secondary btn-sm" }, "Quay l\u1EA1i"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-danger btn-sm", onClick: onDeleteTour }, "X\xF3a tour"))), msg && /* @__PURE__ */ React.createElement("div", { className: "alert alert-success py-2" }, msg), /* @__PURE__ */ React.createElement("ul", { className: "nav nav-tabs mb-4" }, ["info", "schedule", "itinerary"].map((t) => /* @__PURE__ */ React.createElement("li", { className: "nav-item", key: t }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `nav-link ${tab === t ? "active" : ""}`, onClick: () => setTab(t) }, t === "info" ? "Th\xF4ng tin" : t === "schedule" ? "Ng\xE0y kh\u1EDFi h\xE0nh" : "L\u1ECBch tr\xECnh")))), tab === "info" && /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit: onSaveInfo }, /* @__PURE__ */ React.createElement("div", { className: "row g-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-8" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ti\xEAu \u0111\u1EC1"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: tour.tieuDe ?? "", onChange: (e) => setTour({ ...tour, tieuDe: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Gi\xE1"), /* @__PURE__ */ React.createElement("input", { className: "form-control", type: "number", value: tour.gia ?? "", onChange: (e) => setTour({ ...tour, gia: Number(e.target.value) }) }), /* @__PURE__ */ React.createElement("div", { className: "small text-muted mt-1" }, formatVnd(Number(tour.gia ?? 0)))), /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "M\xF4 t\u1EA3"), /* @__PURE__ */ React.createElement("textarea", { className: "form-control", rows: 5, value: tour.moTa ?? "", onChange: (e) => setTour({ ...tour, moTa: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "col-12" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "\u1EA2nh URL"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: tour.hinhAnh ?? "", onChange: (e) => setTour({ ...tour, hinhAnh: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Highlight"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: tour.highlight ?? "", onChange: (e) => setTour({ ...tour, highlight: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "col-md-6 d-flex align-items-end" }, /* @__PURE__ */ React.createElement("div", { className: "form-check" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", checked: !!tour.noiBat, onChange: (e) => setTour({ ...tour, noiBat: e.target.checked }) }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "N\u1ED5i b\u1EADt")))), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary mt-3" }, "L\u01B0u th\xF4ng tin")), tab === "schedule" && /* @__PURE__ */ React.createElement("div", { className: "row g-4" }, /* @__PURE__ */ React.createElement("div", { className: "col-lg-5" }, /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit: onAddSchedule }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold mb-3" }, "Th\xEAm ng\xE0y kh\u1EDFi h\xE0nh"), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y \u0111i"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "form-control", required: true, value: scheduleForm.ngayKhoiHanh, onChange: (e) => setScheduleForm({ ...scheduleForm, ngayKhoiHanh: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y v\u1EC1"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "form-control", value: scheduleForm.ngayKetThuc, onChange: (e) => setScheduleForm({ ...scheduleForm, ngayKetThuc: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "S\u1ED1 ch\u1ED7"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "form-control", value: scheduleForm.soChoToiDa, onChange: (e) => setScheduleForm({ ...scheduleForm, soChoToiDa: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Gi\xE1 override"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "form-control", value: scheduleForm.giaOverride, onChange: (e) => setScheduleForm({ ...scheduleForm, giaOverride: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary btn-sm" }, "Th\xEAm"))), /* @__PURE__ */ React.createElement("div", { className: "col-lg-7" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4" }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table mb-0" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Ng\xE0y \u0111i"), /* @__PURE__ */ React.createElement("th", null, "Ng\xE0y v\u1EC1"), /* @__PURE__ */ React.createElement("th", null, "Ch\u1ED7"), /* @__PURE__ */ React.createElement("th", null, "\u0110\xE3 \u0111\u1EB7t"), /* @__PURE__ */ React.createElement("th", null, "Gi\xE1"), /* @__PURE__ */ React.createElement("th", null, "Tr\u1EA1ng th\xE1i"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, schedules.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, s.ngayKhoiHanh), /* @__PURE__ */ React.createElement("td", null, s.ngayKetThuc), /* @__PURE__ */ React.createElement("td", null, s.soChoToiDa), /* @__PURE__ */ React.createElement("td", null, s.soChoDaDat ?? 0), /* @__PURE__ */ React.createElement("td", null, s.giaOverride != null ? formatVnd(Number(s.giaOverride)) : "-"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${s.trangThai === "ACTIVE" ? "bg-success" : "bg-secondary"}` }, s.trangThai ?? "ACTIVE")), /* @__PURE__ */ React.createElement("td", { className: "text-end" }, /* @__PURE__ */ React.createElement("div", { className: "btn-group btn-group-sm" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => onToggleSchedule(s.id) }, s.trangThai === "ACTIVE" ? "\u1EA8n" : "M\u1EDF"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-outline-danger", onClick: () => onDeleteSchedule(s.id) }, "X\xF3a"))))), schedules.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, className: "text-center py-4 text-muted" }, "Ch\u01B0a c\xF3 l\u1ECBch.")))))))), tab === "itinerary" && /* @__PURE__ */ React.createElement("div", { className: "row g-4" }, /* @__PURE__ */ React.createElement("div", { className: "col-lg-5" }, /* @__PURE__ */ React.createElement("form", { className: "card border-0 shadow-sm rounded-4 p-4", onSubmit: onAddItinerary }, /* @__PURE__ */ React.createElement("h5", { className: "fw-bold mb-3" }, "Th\xEAm ng\xE0y l\u1ECBch tr\xECnh"), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ng\xE0y th\u1EE9"), /* @__PURE__ */ React.createElement("input", { type: "number", min: 1, className: "form-control", value: itineraryForm.ngayThu, onChange: (e) => setItineraryForm({ ...itineraryForm, ngayThu: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ti\xEAu \u0111\u1EC1"), /* @__PURE__ */ React.createElement("input", { className: "form-control", required: true, value: itineraryForm.tieuDe, onChange: (e) => setItineraryForm({ ...itineraryForm, tieuDe: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Ho\u1EA1t \u0111\u1ED9ng ch\xEDnh"), /* @__PURE__ */ React.createElement("input", { className: "form-control", value: itineraryForm.hoatDongChinh, onChange: (e) => setItineraryForm({ ...itineraryForm, hoatDongChinh: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "N\u1ED9i dung"), /* @__PURE__ */ React.createElement("textarea", { className: "form-control", rows: 5, value: itineraryForm.moTa, onChange: (e) => setItineraryForm({ ...itineraryForm, moTa: e.target.value }) })), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary btn-sm" }, "Th\xEAm l\u1ECBch tr\xECnh"))), /* @__PURE__ */ React.createElement("div", { className: "col-lg-7" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm rounded-4 p-4" }, (tour.lichTrinhs ?? []).length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-muted" }, "Ch\u01B0a c\xF3 l\u1ECBch tr\xECnh."), (tour.lichTrinhs ?? []).map((lt, idx) => /* @__PURE__ */ React.createElement("div", { key: lt.id ?? `${lt.ngayThu}-${idx}`, className: "border-bottom py-3" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "fw-bold" }, "Ng\xE0y ", lt.ngayThu, ": ", lt.tieuDe), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDeleteItinerary(idx) }, "X\xF3a")), /* @__PURE__ */ React.createElement("div", { className: "text-muted small" }, lt.moTa ?? lt.noiDungLines?.join(" ") ?? ""), lt.hoatDongChinh && /* @__PURE__ */ React.createElement("div", { className: "small mt-1" }, /* @__PURE__ */ React.createElement("strong", null, "Ho\u1EA1t \u0111\u1ED9ng:"), " ", lt.hoatDongChinh)))))));
}
export {
  AdminTourDetailPage
};
