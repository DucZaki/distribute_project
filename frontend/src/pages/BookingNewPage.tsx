import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { applyPromo, createBooking, initVnPay } from '../api/bookings'
import { getTour } from '../api/tours'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import type { TourDetail } from '../types/api'
import { formatVnd } from '../utils/format'

export function BookingNewPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const nkhId = Number(searchParams.get('nkhId'))
  const tourId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tour, setTour] = useState<TourDetail | null>(null)
  const [soLuong, setSoLuong] = useState(1)
  const [maGiamGia, setMaGiamGia] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tourId) getTour(tourId).then((r) => setTour(r.data)).catch(() => setTour(null))
  }, [tourId])

  const subtotal = (tour?.gia ?? 0) * soLuong
  const total = Math.max(subtotal - discount, 0)

  async function validatePromo() {
    if (!maGiamGia) return
    try {
      const res = await applyPromo(maGiamGia, subtotal)
      if (res.data.valid) {
        setDiscount(res.data.discount ?? 0)
        setPromoMsg(res.data.message ?? 'Áp dụng mã thành công')
      } else {
        setDiscount(0)
        setPromoMsg(res.data.message ?? 'Mã không hợp lệ')
      }
    } catch {
      setPromoMsg('Không kiểm tra được mã giảm giá')
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!tourId || !nkhId) return
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await createBooking({
        idChuyenDi: tourId,
        idNgayKhoiHanh: nkhId,
        soLuong: Number(fd.get('soLuong')),
        hoTen: String(fd.get('hoTen')),
        email: String(fd.get('email')),
        soDienThoai: String(fd.get('soDienThoai')),
        maGiamGia: maGiamGia || undefined,
        ghiChu: String(fd.get('ghiChu') ?? '') || undefined,
      })
      const booking = res.data
      try {
        const pay = await initVnPay(booking.id, booking.tongGia)
        if (pay.data.redirectUrl) {
          window.location.href = pay.data.redirectUrl
          return
        }
      } catch {
        /* VNPay chưa config */
      }
      navigate('/user/bookings')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể đặt tour')
    } finally {
      setLoading(false)
    }
  }

  if (!tourId || !nkhId) {
    return <div className="container pt-5"><div className="alert alert-warning">Thiếu thông tin tour hoặc ngày khởi hành.</div></div>
  }

  return (
    <div className="container pt-5" style={{ marginTop: 30 }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/tour">Tour</Link></li>
          <li className="breadcrumb-item"><Link to={`/tour/${tourId}`}>{tour?.tieuDe}</Link></li>
          <li className="breadcrumb-item active">Đặt tour</li>
        </ol>
      </nav>
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4 booking-card">
            <div className="card-header booking-card-header">
              <div className="booking-card-title">Thông tin liên lạc</div>
            </div>
            <div className="card-body p-4 booking-form">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit} id="bookingForm">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ và tên *</label>
                    <input name="hoTen" className="form-control" defaultValue={user?.hoTen ?? ''} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input name="email" type="email" className="form-control" defaultValue={user?.email ?? ''} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại *</label>
                    <input name="soDienThoai" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số lượng khách *</label>
                    <input name="soLuong" type="number" min={1} max={20} className="form-control" value={soLuong} onChange={(e) => setSoLuong(Number(e.target.value))} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea name="ghiChu" className="form-control" rows={3} />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Mã giảm giá</label>
                    <input className="form-control" value={maGiamGia} onChange={(e) => setMaGiamGia(e.target.value)} />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button type="button" className="btn btn-outline-primary w-100" onClick={validatePromo}>Áp dụng</button>
                  </div>
                  {promoMsg && <div className="col-12"><small className="text-muted">{promoMsg}</small></div>}
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary fw-bold px-5" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold">{tour?.tieuDe}</h5>
              <hr />
              <div className="d-flex justify-content-between"><span>Giá tour × {soLuong}</span><span>{formatVnd(subtotal)}</span></div>
              {discount > 0 && <div className="d-flex justify-content-between text-success"><span>Giảm giá</span><span>-{formatVnd(discount)}</span></div>}
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2"><span>Tổng</span><span className="text-danger">{formatVnd(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
