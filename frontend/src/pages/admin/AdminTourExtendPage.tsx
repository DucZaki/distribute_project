import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAdminTour, updateAdminTour, type TourResponse } from '../../api/adminTours'
import { formatTourDate } from '../../utils/tourAdminHelpers'
import { formatVnd, imageUrl, transportLabel } from '../../utils/format'

export function AdminTourExtendPage() {
  const { id } = useParams()
  const tourId = Number(id)
  const navigate = useNavigate()
  const [tour, setTour] = useState<TourResponse | null>(null)
  const [ngayKhoiHanh, setNgayKhoiHanh] = useState('')
  const [ngayKetThuc, setNgayKetThuc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tourId) return
    getAdminTour(tourId).then((r) => setTour(r.data)).catch(() => setTour(null))
  }, [tourId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!confirm('Xác nhận gia hạn chuyến đi?')) return
    if (!tour) return
    setError('')
    try {
      await updateAdminTour(tourId, {
        tieuDe: tour.tieuDe!,
        moTa: tour.moTa,
        gia: Number(tour.gia),
        idDiemDen: tour.diemDen!.id!,
        hinhAnh: tour.hinhAnh,
        highlight: tour.highlight,
        noiBat: tour.noiBat,
        ngayKhoiHanh,
        ngayKetThuc,
      })
      navigate('/admin/tour/active')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gia hạn thất bại')
    }
  }

  if (!tour) return <div className="text-muted py-5">Đang tải...</div>

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Link to="/admin/tour/completed" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" /> Quay lại
        </Link>
        <h4 className="fw-bold text-primary mb-0">Gia hạn chuyến đi</h4>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">{tour.tieuDe}</h5>
              <div className="row">
                <div className="col-md-4 text-center">
                  <img
                    src={imageUrl(tour.hinhAnh)}
                    className="img-fluid rounded shadow"
                    style={{ height: 220, objectFit: 'cover' }}
                    alt={tour.tieuDe}
                  />
                </div>
                <div className="col-md-8">
                  <div className="mb-2">
                    <span className="text-muted">Giá dịch vụ: </span>
                    <span className="text-danger fw-bold">{formatVnd(Number(tour.gia ?? 0))}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Ngày khởi hành hiện tại: </span>
                    <span className="fw-semibold text-danger">{formatTourDate(tour.ngayKhoiHanh)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Ngày kết thúc hiện tại: </span>
                    <span className="fw-semibold text-danger">{formatTourDate(tour.ngayKetThuc)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Phương tiện: </span>
                    <span>{transportLabel(tour.phuongTien?.ten)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Điểm đến: </span>
                    <span>{tour.diemDen?.ten}</span>
                  </div>
                </div>
              </div>
              <hr />
              <div className="fw-semibold text-muted mb-2">Mô tả</div>
              <div className="p-3 bg-light rounded">{tour.moTa}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3 text-success">Gia hạn chuyến đi</h5>
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Ngày khởi hành mới</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={ngayKhoiHanh}
                    onChange={(e) => setNgayKhoiHanh(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày kết thúc mới</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={ngayKetThuc}
                    onChange={(e) => setNgayKetThuc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-calendar-check me-1" /> Gia hạn ngay
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
