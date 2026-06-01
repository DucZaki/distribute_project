import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, initVnPay, myBookings } from '../api/bookings'
import { UserSidebar } from '../components/UserSidebar'
import type { BookingResponse } from '../types/api'
import { bookingTabFilter, formatVnd, statusLabel } from '../utils/format'

type Tab = 'all' | 'pending' | 'paid' | 'failed'

export function BookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [tab, setTab] = useState<Tab>('all')

  function reload() {
    myBookings(0, 50).then((r) => setBookings(r.data.content ?? [])).catch(() => setBookings([]))
  }

  useEffect(() => { reload() }, [])

  const filtered = bookings.filter((b) => bookingTabFilter(tab, b.trangThai))

  return (
    <div className="container my-5 pt-4">
      <div className="mb-3">
        <Link to="/" className="text-decoration-none text-dark small fw-bold">
          <i className="bi bi-arrow-left me-1" /> Quay lại trang chủ
        </Link>
      </div>
      <div className="row">
        <UserSidebar active="bookings" />
        <div className="col-lg-9">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-luggage-fill text-booking-primary fs-3 me-2" />
            <h3 className="fw-bold mb-0">Lịch sử đặt chỗ của tôi</h3>
          </div>
          <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm small fw-bold">
            {(['all', 'pending', 'paid', 'failed'] as Tab[]).map((t) => (
              <li key={t} className="nav-item">
                <button type="button" className={`nav-link rounded-pill${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'all' ? 'Tất cả' : t === 'pending' ? 'Chờ thanh toán' : t === 'paid' ? 'Đã thanh toán' : 'Thất bại/Hết hạn'}
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && <div className="alert alert-light">Chưa có đơn trong mục này.</div>}
          {filtered.map((b) => (
            <div key={b.id} className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <strong>Đơn #{b.id}</strong>
                  <span className="badge bg-secondary">{statusLabel(b.trangThai)}</span>
                </div>
                <p className="text-muted small mb-1">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                <p>{b.soLuong} khách · {formatVnd(b.tongGia)}</p>
                {b.maCheckIn && <p className="small">Mã check-in: <code>{b.maCheckIn}</code></p>}
                <div className="d-flex gap-2 flex-wrap">
                  {b.trangThai === 'PENDING' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => initVnPay(b.id, b.tongGia).then((r) => { if (r.data.redirectUrl) window.location.href = r.data.redirectUrl })}>
                      Thanh toán VNPay
                    </button>
                  )}
                  {b.trangThai === 'PENDING' && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => cancelBooking(b.id).then(reload)}>Huỷ</button>
                  )}
                  {b.maCheckIn && (
                    <Link to={`/check-in/${b.maCheckIn}`} className="btn btn-outline-primary btn-sm">QR check-in</Link>
                  )}
                  <Link to={`/tour/${b.idChuyenDi}`} className="btn btn-outline-secondary btn-sm">Xem tour</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
