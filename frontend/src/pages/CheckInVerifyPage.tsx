import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { confirmCheckIn, getCheckInDetail } from '../api/bookings'
import { useAuth } from '../auth/AuthContext'
import type { CheckInDetail } from '../types/api'
import { formatVnd, statusLabel } from '../utils/format'

export function CheckInVerifyPage() {
  const { token } = useParams()
  const { isAdmin } = useAuth()
  const [detail, setDetail] = useState<CheckInDetail | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function reload() {
    if (!token) return
    getCheckInDetail(token).then((r) => setDetail(r.data)).catch(() => {
      setDetail({ valid: false, message: 'Không thể tải thông tin check-in.' })
    })
  }

  useEffect(() => { reload() }, [token])

  async function onConfirm() {
    if (!token) return
    setLoading(true)
    setMessage('')
    try {
      const res = await confirmCheckIn(token)
      setMessage(res.data.firstTime ? 'Check-in thành công.' : 'Khách đã check-in trước đó.')
      reload()
    } catch (err: any) {
      setMessage(err.message ?? 'Không thể check-in.')
    } finally {
      setLoading(false)
    }
  }

  if (!detail) {
    return <div className="container py-5 text-muted">Đang tải thông tin check-in...</div>
  }

  if (!detail.valid) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center mx-auto" style={{ maxWidth: 560 }}>
          <i className="bi bi-qr-code-scan display-4 text-danger mb-3" />
          <h3 className="fw-bold">QR không hợp lệ</h3>
          <p className="text-muted">{detail.message ?? 'Mã QR không hợp lệ hoặc đã hết hạn.'}</p>
          <Link to="/" className="btn btn-primary rounded-pill px-4">Về trang chủ</Link>
        </div>
      </div>
    )
  }

  const qrSrc = `/api/check-in/${encodeURIComponent(detail.maCheckIn ?? token ?? '')}/qr?size=260`

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden mx-auto" style={{ maxWidth: 880 }}>
        <div className="row g-0">
          <div className="col-md-5 bg-light p-4 d-flex flex-column align-items-center justify-content-center text-center">
            <img src={qrSrc} alt="QR check-in" className="img-fluid rounded-4 bg-white p-2 shadow-sm" style={{ maxWidth: 280 }} />
            <div className="small text-muted mt-3">Mã check-in</div>
            <code>{detail.maCheckIn}</code>
          </div>
          <div className="col-md-7 p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <div className="small text-muted text-uppercase fw-bold">Phiếu check-in</div>
                <h3 className="fw-bold mb-0">Đơn #{detail.bookingId}</h3>
              </div>
              <span className={`badge ${detail.checkedInAt ? 'bg-success' : 'bg-secondary'}`}>
                {detail.checkedInAt ? 'Đã check-in' : statusLabel(detail.trangThai ?? '')}
              </span>
            </div>

            <div className="border rounded-4 p-3 mb-3">
              <div className="fw-bold mb-1">{detail.tourTitle || `Tour #${detail.tourId}`}</div>
              <div className="text-muted small">{detail.soLuong ?? 0} khách · {formatVnd(Number(detail.tongGia ?? 0))}</div>
            </div>

            <p className="mb-1"><strong>Khách hàng:</strong> {detail.hoTen}</p>
            <p className="mb-1"><strong>Email:</strong> {detail.email || '-'}</p>
            <p className="mb-1"><strong>SĐT:</strong> {detail.soDienThoai || '-'}</p>
            <p className="mb-3"><strong>Thời gian check-in:</strong> {detail.checkedInAt ? new Date(detail.checkedInAt).toLocaleString('vi-VN') : 'Chưa check-in'}</p>

            {message && <div className="alert alert-info py-2">{message}</div>}

            <div className="d-flex gap-2 flex-wrap">
              {isAdmin && (
                <button type="button" className="btn btn-primary rounded-pill px-4" disabled={loading} onClick={onConfirm}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận check-in'}
                </button>
              )}
              {detail.tourId && <Link to={`/tour/${detail.tourId}`} className="btn btn-outline-secondary rounded-pill px-4">Xem tour</Link>}
              <Link to="/" className="btn btn-outline-dark rounded-pill px-4">Trang chủ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
