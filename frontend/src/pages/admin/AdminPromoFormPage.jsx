import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listAdminTours } from "../../api/adminTours";
import { createPromo, getPromo, updatePromo } from "../../api/adminPromos";
import { formatVnd } from "../../utils/format";

const EMPTY = {
  ma: "",
  moTa: "",
  loai: "PERCENT",
  giaTri: "",
  giamToiDa: "",
  donToiThieu: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  soLanDungToiDa: "",
  gioiHanMoiUser: "1",
  kieuChienDich: "STANDARD",
  soNgayDatTruoc: "30",
  soGioLastMinute: "48",
  active: true,
  tourIds: [],
};

const KIEU_LABELS = {
  STANDARD: "Thường",
  EARLY_BIRD: "Early Bird (đặt sớm)",
  LAST_MINUTE: "Last-minute (phút chót)",
};

function AdminPromoFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    listAdminTours("ACTIVE", 0, 200)
      .then((r) => setTours(r.data?.content ?? []))
      .catch(() => setTours([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getPromo(Number(id))
      .then((r) => {
        const p = r.data;
        if (!p) return;
        setForm({
          ma: p.ma ?? "",
          moTa: p.moTa ?? "",
          loai: p.loai ?? "PERCENT",
          giaTri: String(p.giaTri ?? ""),
          giamToiDa: p.giamToiDa != null ? String(p.giamToiDa) : "",
          donToiThieu: p.donToiThieu != null ? String(p.donToiThieu) : "",
          ngayBatDau: p.ngayBatDau ?? "",
          ngayKetThuc: p.ngayKetThuc ?? "",
          soLanDungToiDa: p.soLanDungToiDa != null ? String(p.soLanDungToiDa) : "",
          gioiHanMoiUser: p.gioiHanMoiUser != null ? String(p.gioiHanMoiUser) : "",
          kieuChienDich: p.kieuChienDich ?? "STANDARD",
          soNgayDatTruoc: p.soNgayDatTruoc != null ? String(p.soNgayDatTruoc) : "30",
          soGioLastMinute: p.soGioLastMinute != null ? String(p.soGioLastMinute) : "48",
          active: p.active !== false,
          tourIds: p.tourIds ?? [],
        });
      })
      .catch(() => setError("Không tải được mã giảm giá"));
  }, [id, isEdit]);

  function toggleTour(tourId) {
    setForm((f) => {
      const set = new Set(f.tourIds);
      if (set.has(tourId)) set.delete(tourId);
      else set.add(tourId);
      return { ...f, tourIds: [...set] };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      ma: form.ma.trim(),
      moTa: form.moTa,
      loai: form.loai,
      giaTri: Number(form.giaTri),
      giamToiDa: form.giamToiDa ? Number(form.giamToiDa) : null,
      donToiThieu: form.donToiThieu ? Number(form.donToiThieu) : null,
      ngayBatDau: form.ngayBatDau || null,
      ngayKetThuc: form.ngayKetThuc || null,
      soLanDungToiDa: form.soLanDungToiDa ? Number(form.soLanDungToiDa) : null,
      gioiHanMoiUser: form.gioiHanMoiUser ? Number(form.gioiHanMoiUser) : null,
      kieuChienDich: form.kieuChienDich,
      soNgayDatTruoc: form.kieuChienDich === "EARLY_BIRD" ? Number(form.soNgayDatTruoc) : null,
      soGioLastMinute: form.kieuChienDich === "LAST_MINUTE" ? Number(form.soGioLastMinute) : null,
      active: form.active,
      tourIds: form.tourIds,
    };
    try {
      if (isEdit) await updatePromo(Number(id), body);
      else await createPromo(body);
      navigate("/admin/promo");
    } catch (err) {
      setError(err.message ?? "Lỗi lưu mã");
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 720 }}>
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">{isEdit ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}</h2>
        <Link to="/admin/promo" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSubmit}>
        <h6 className="fw-bold text-uppercase text-muted small mb-3">Thông tin cơ bản</h6>
        <div className="mb-3">
          <label className="form-label">Mã coupon *</label>
          <input className="form-control text-uppercase" required value={form.ma} placeholder="HE2026" onChange={(e) => setForm({ ...form, ma: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <input className="form-control" value={form.moTa} onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Loại giảm *</label>
            <select className="form-select" value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value })}>
              <option value="PERCENT">Theo phần trăm (%)</option>
              <option value="AMOUNT">Số tiền cố định (VND)</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Giá trị *</label>
            <input type="number" className="form-control" required min={1} value={form.giaTri} onChange={(e) => setForm({ ...form, giaTri: e.target.value })} />
            <small className="text-muted">{form.loai === "PERCENT" ? "VD: 10 = giảm 10%" : "VD: 200000 = giảm 200.000đ"}</small>
          </div>
        </div>

        {form.loai === "PERCENT" && (
          <div className="mb-3">
            <label className="form-label">Giảm tối đa (VND)</label>
            <input type="number" className="form-control" value={form.giamToiDa} placeholder="500000" onChange={(e) => setForm({ ...form, giamToiDa: e.target.value })} />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Đơn tối thiểu (VND)</label>
          <input type="number" className="form-control" value={form.donToiThieu} placeholder="2000000" onChange={(e) => setForm({ ...form, donToiThieu: e.target.value })} />
        </div>

        <h6 className="fw-bold text-uppercase text-muted small mb-3 mt-4">Chiến dịch</h6>
        <div className="mb-3">
          <label className="form-label">Kiểu mã</label>
          <select className="form-select" value={form.kieuChienDich} onChange={(e) => setForm({ ...form, kieuChienDich: e.target.value })}>
            {Object.entries(KIEU_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        {form.kieuChienDich === "EARLY_BIRD" && (
          <div className="mb-3">
            <label className="form-label">Đặt trước ít nhất (ngày)</label>
            <input type="number" className="form-control" min={1} value={form.soNgayDatTruoc} onChange={(e) => setForm({ ...form, soNgayDatTruoc: e.target.value })} />
          </div>
        )}
        {form.kieuChienDich === "LAST_MINUTE" && (
          <div className="mb-3">
            <label className="form-label">Khởi hành trong vòng (giờ)</label>
            <input type="number" className="form-control" min={1} value={form.soGioLastMinute} onChange={(e) => setForm({ ...form, soGioLastMinute: e.target.value })} />
          </div>
        )}

        <h6 className="fw-bold text-uppercase text-muted small mb-3 mt-4">Giới hạn &amp; thời hạn</h6>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Ngày bắt đầu</label>
            <input type="date" className="form-control" value={form.ngayBatDau} onChange={(e) => setForm({ ...form, ngayBatDau: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ngày hết hạn</label>
            <input type="date" className="form-control" value={form.ngayKetThuc} onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })} />
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Tổng lượt dùng tối đa</label>
            <input type="number" className="form-control" value={form.soLanDungToiDa} placeholder="50" onChange={(e) => setForm({ ...form, soLanDungToiDa: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Giới hạn mỗi user</label>
            <input type="number" className="form-control" min={1} value={form.gioiHanMoiUser} onChange={(e) => setForm({ ...form, gioiHanMoiUser: e.target.value })} />
          </div>
        </div>

        <h6 className="fw-bold text-uppercase text-muted small mb-2 mt-4">Tour áp dụng</h6>
        <p className="small text-muted">Không chọn = áp dụng tất cả tour</p>
        <div className="border rounded-3 p-3 mb-3" style={{ maxHeight: 220, overflowY: "auto" }}>
          {tours.length === 0 && <p className="small text-muted mb-0">Đang tải tour...</p>}
          {tours.map((t) => (
            <div key={t.id} className="form-check">
              <input className="form-check-input" type="checkbox" id={`tour-${t.id}`} checked={form.tourIds.includes(t.id)} onChange={() => toggleTour(t.id)} />
              <label className="form-check-label" htmlFor={`tour-${t.id}`}>
                #{t.id} — {t.tieuDe} {t.gia != null && <span className="text-muted">({formatVnd(t.gia)})</span>}
              </label>
            </div>
          ))}
        </div>

        <div className="form-check mb-4">
          <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="promoActive" />
          <label className="form-check-label" htmlFor="promoActive">Đang kích hoạt</label>
        </div>

        <button type="submit" className="btn btn-primary px-4 fw-bold">Lưu mã</button>
      </form>
    </div>
  );
}

export { AdminPromoFormPage };
