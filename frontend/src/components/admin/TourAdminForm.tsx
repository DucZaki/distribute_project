import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getTourFormOptions,
  type DiemDenSummary,
  type PhuongTienSummary,
  type TourFormOptions,
} from '../../api/adminTours'
import {
  chauLucOptions,
  citiesForCountry,
  countriesForChauLuc,
  inferChauLuc,
} from '../../utils/tourAdminHelpers'
import { imageUrl } from '../../utils/format'

export type TourFormState = {
  tieuDe: string
  gia: string
  ngayKhoiHanh: string
  ngayKetThuc: string
  chauLuc: string
  quocGia: string
  idDiemDen: string
  idPhuongTien: string
  idDiemDon: string
  moTa: string
  highlight: string
  hinhAnh: string
  imageFile: File | null
  noiBat: boolean
}

export const emptyTourForm = (): TourFormState => ({
  tieuDe: '',
  gia: '',
  ngayKhoiHanh: '',
  ngayKetThuc: '',
  chauLuc: '',
  quocGia: '',
  idDiemDen: '',
  idPhuongTien: '',
  idDiemDon: '',
  moTa: '',
  highlight: '',
  hinhAnh: '',
  imageFile: null,
  noiBat: false,
})

type Props = {
  form: TourFormState
  onChange: (next: TourFormState) => void
  requireImage?: boolean
  footer: ReactNode
}

export function TourAdminFormLayout({ form, onChange, requireImage = false, footer }: Props) {
  const [options, setOptions] = useState<TourFormOptions>({
    destinations: [],
    vehicles: [],
    pickups: [],
  })
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    getTourFormOptions()
      .then((r) => setOptions(r.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (form.imageFile) {
      const url = URL.createObjectURL(form.imageFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(form.hinhAnh ? imageUrl(form.hinhAnh) : '')
  }, [form.imageFile, form.hinhAnh])

  const countries = useMemo(
    () => (form.chauLuc ? countriesForChauLuc(form.chauLuc, options.destinations) : []),
    [form.chauLuc, options.destinations],
  )

  const cities = useMemo(
    () => (form.quocGia ? citiesForCountry(form.quocGia, options.destinations) : []),
    [form.quocGia, options.destinations],
  )

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-info-circle text-primary me-2" />
              Thông tin cơ bản
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small text-uppercase">
                  Tên / Tiêu đề chuyến đi <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light"
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  required
                  value={form.tieuDe}
                  onChange={(e) => onChange({ ...form, tieuDe: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small text-uppercase">
                  Giá gốc (VND) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control bg-light"
                    placeholder="1000000"
                    min={0}
                    required
                    value={form.gia}
                    onChange={(e) => onChange({ ...form, gia: e.target.value })}
                  />
                  <span className="input-group-text bg-white border-start-0 fw-bold">₫</span>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small text-uppercase">Nhãn Nổi Bật</label>
                <div className="d-flex gap-3 align-items-center mt-2">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="noiBat"
                      id="noiBatYes"
                      checked={form.noiBat}
                      onChange={() => onChange({ ...form, noiBat: true })}
                    />
                    <label className="form-check-label fw-bold" htmlFor="noiBatYes">
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-star-fill me-1" />
                        Bật
                      </span>
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="noiBat"
                      id="noiBatNo"
                      checked={!form.noiBat}
                      onChange={() => onChange({ ...form, noiBat: false })}
                    />
                    <label className="form-check-label fw-bold text-muted" htmlFor="noiBatNo">
                      Tắt
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-body-text text-primary me-2" />
              Nội dung &amp; Highlight
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small text-uppercase">
                  Điểm nhấn chuyến đi (Highlight) <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control bg-light"
                  rows={3}
                  placeholder="Các trải nghiệm độc quyền chỉ có tại tour này..."
                  required
                  value={form.highlight}
                  onChange={(e) => onChange({ ...form, highlight: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small text-uppercase">
                  Mô tả đầy đủ (Description) <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control bg-light"
                  rows={5}
                  placeholder="Thông tin chi tiết về chuyến đi..."
                  required
                  value={form.moTa}
                  onChange={(e) => onChange({ ...form, moTa: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-geo-alt text-primary me-2" />
              Hành trình
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label fw-semibold text-muted small">
                  Khởi hành <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-light"
                  required
                  value={form.ngayKhoiHanh}
                  onChange={(e) => onChange({ ...form, ngayKhoiHanh: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold text-muted small">
                  Kết thúc <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-light"
                  required
                  value={form.ngayKetThuc}
                  onChange={(e) => onChange({ ...form, ngayKetThuc: e.target.value })}
                />
              </div>
              <div className="col-12">
                <hr className="text-muted opacity-25 my-1" />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold text-muted small">Châu lục</label>
                <select
                  className="form-select bg-light"
                  value={form.chauLuc}
                  onChange={(e) =>
                    onChange({ ...form, chauLuc: e.target.value, quocGia: '', idDiemDen: '' })
                  }
                >
                  <option value="">-- Chọn --</option>
                  {chauLucOptions().map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold text-muted small">Quốc gia</label>
                <select
                  className="form-select bg-light"
                  value={form.quocGia}
                  onChange={(e) => onChange({ ...form, quocGia: e.target.value, idDiemDen: '' })}
                  disabled={!form.chauLuc}
                >
                  <option value="">-- Tùy chọn --</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small">Thành phố đến</label>
                <select
                  className="form-select bg-light"
                  required
                  value={form.idDiemDen}
                  onChange={(e) => onChange({ ...form, idDiemDen: e.target.value })}
                  disabled={!form.quocGia}
                >
                  <option value="">-- Chọn thành phố --</option>
                  {cities.map((d: DiemDenSummary) => (
                    <option key={d.id} value={d.id}>
                      {d.ten}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <hr className="text-muted opacity-25 my-1" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small">Nơi đón khách</label>
                <select
                  className="form-select bg-light"
                  value={form.idDiemDon}
                  onChange={(e) => onChange({ ...form, idDiemDon: e.target.value })}
                >
                  <option value="">-- Chọn điểm đón --</option>
                  {options.pickups.map((dd) => (
                    <option key={dd.id} value={dd.id}>
                      {dd.ten}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small">Phương tiện di chuyển</label>
                <select
                  className="form-select bg-light"
                  value={form.idPhuongTien}
                  onChange={(e) => onChange({ ...form, idPhuongTien: e.target.value })}
                >
                  <option value="">-- Chọn phương tiện --</option>
                  {options.vehicles.map((v: PhuongTienSummary) => (
                    <option key={v.id} value={v.id}>
                      {v.loai || v.ten}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-image text-primary me-2" />
              Ảnh đại diện
            </h5>
          </div>
          <div className="card-body p-4">
            {previewUrl && (
              <div className="mb-3 text-center">
                <img
                  src={previewUrl}
                  alt="Xem trước ảnh tour"
                  className="rounded-4 shadow-sm w-100"
                  style={{ height: 180, objectFit: 'cover' }}
                />
              </div>
            )}
            <label className="form-label small fw-bold text-muted">
              Chọn ảnh từ máy tính {requireImage && <span className="text-danger">*</span>}
            </label>
            <input
              type="file"
              className="form-control bg-light"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={requireImage && !form.hinhAnh}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                onChange({ ...form, imageFile: file })
              }}
            />
            <div className="mt-3 text-center p-3 border rounded bg-light text-muted small">
              Khuyên dùng ảnh chất lượng cao (.jpg, .png) tỉ lệ 16:9
            </div>
          </div>
        </div>

        <div className="d-grid gap-2">{footer}</div>
      </div>
    </div>
  )
}

export function buildTourPayload(form: TourFormState, hinhAnh?: string) {
  return {
    tieuDe: form.tieuDe.trim(),
    moTa: form.moTa,
    gia: Number(form.gia),
    idDiemDen: Number(form.idDiemDen),
    idPhuongTien: form.idPhuongTien ? Number(form.idPhuongTien) : undefined,
    idDiemDonDefault: form.idDiemDon ? Number(form.idDiemDon) : undefined,
    hinhAnh: (hinhAnh ?? form.hinhAnh) || undefined,
    highlight: form.highlight,
    ngayKhoiHanh: form.ngayKhoiHanh || null,
    ngayKetThuc: form.ngayKetThuc || null,
    noiBat: form.noiBat,
    lichTrinhs: [] as [],
  }
}

/** Khởi tạo cascade châu lục / quốc gia từ điểm đến đã chọn */
export function cascadeFromDestination(
  diemDen: DiemDenSummary | undefined,
  partial: Partial<TourFormState> = {},
): Partial<TourFormState> {
  if (!diemDen?.vungMien) return partial
  const quocGia = diemDen.vungMien
  return {
    ...partial,
    chauLuc: inferChauLuc(quocGia),
    quocGia,
    idDiemDen: diemDen.id ? String(diemDen.id) : '',
  }
}
