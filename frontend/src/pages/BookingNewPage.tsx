import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { applyPromo, createBooking, initVnPay } from '../api/bookings'
import { fetchFlightQuote, getTour, type FlightQuote } from '../api/tours'
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
  const [diemDonId, setDiemDonId] = useState(0)
  const [quote, setQuote] = useState<FlightQuote | null>(null)
  const [soLuong, setSoLuong] = useState(1)
  const [maGiamGia, setMaGiamGia] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const diemDonOptions = useMemo(() => {
    const list = tour?.diemDons?.length
      ? [...tour.diemDons]
      : tour?.diemDon
        ? [tour.diemDon]
        : []
    return list
  }, [tour])

  useEffect(() => {
    if (!tourId) return
    getTour(tourId).then((r) => {
      setTour(r.data)
      const fromUrl = Number(searchParams.get('diemDonId'))
      const first = r.data.diemDons?.[0]?.id ?? r.data.diemDon?.id
      setDiemDonId(fromUrl || first || 0)
    }).catch(() => setTour(null))
  }, [tourId, searchParams])

  useEffect(() => {
    if (!tourId || !nkhId || !diemDonId) return
    fetchFlightQuote(tourId, nkhId, diemDonId, false)
      .then((r) => setQuote(r.data))
      .catch(() => setQuote(null))
  }, [tourId, nkhId, diemDonId])

  const unitPrice = quote?.available && quote.unitPrice != null ? quote.unitPrice : (tour?.gia ?? 0)
  const subtotal = unitPrice * soLuong
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
    if (!tourId || !nkhId || !diemDonId) return
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await createBooking({
        idChuyenDi: tourId,
        idNgayKhoiHanh: nkhId,
        idDiemDon: diemDonId,
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
        setError('VNPay chưa được cấu hình (VNP_TMN_CODE / VNP_HASH_SECRET).')
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
                  {diemDonOptions.length > 0 && (
                    <div className="col-12">
                      <label className="form-label">Điểm đón *</label>
                      <select
                        className="form-select"
                        value={diemDonId}
                        onChange={(e) => setDiemDonId(Number(e.target.value))}
                        required
                      >
                        {diemDonOptions.map((d) => (
                          <option key={d.id} value={d.id}>{d.ten}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
                      {loading ? 'Đang xử lý...' : 'Thanh toán VNPay'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="fw-bold">{tour?.tieuDe}</h5>
              {quote?.available && (
                <div className="small text-muted mb-2">
                  <div>Vé máy bay: {formatVnd(Number(quote.tongGiaVe ?? 0))}</div>
                  <div>Chuyến đi: {quote.maChuyenBayDi} · {quote.gioBayDi}</div>
                  <div>Ngày: {quote.ngayDi} → {quote.ngayVe || '—'}</div>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <span>Đơn giá × {soLuong}</span>
                <span>{formatVnd(unitPrice * soLuong)}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Giảm giá</span>
                  <span>-{formatVnd(discount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                <span>Tổng</span>
                <span className="text-danger">{formatVnd(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
