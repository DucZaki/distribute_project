import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminBookings, type AdminBooking } from '../../api/adminBookings'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

type InvoiceData = {
  id: number
  user: string
  tour: string
  people: number
  total: number
  date: string
  status: string
  userId?: number
  checkinToken?: string
}

function bookingStatusBadge(status?: string) {
  if (status === 'PAID' || status === 'CONFIRMED') {
    return <span className="badge bg-success rounded-pill px-3 py-2">Thành công</span>
  }
  if (status === 'PENDING') {
    return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Chờ thanh toán</span>
  }
  if (status === 'FAILED' || status === 'CANCELLED') {
    return <span className="badge bg-danger rounded-pill px-3 py-2">Thất bại</span>
  }
  return <span className="badge bg-secondary rounded-pill px-3 py-2">{status}</span>
}

function formatBookingDate(b: AdminBooking) {
  const raw = b.ngayDat ?? b.createdAt
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleString('vi-VN')
  } catch {
    return String(raw)
  }
}

export function AdminBookingsPage() {
  const [items, setItems] = useState<AdminBooking[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)

  function load(p = page) {
    listAdminBookings(undefined, p, 10)
      .then((r) => {
        setItems(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
        setPage(r.data.page ?? p)
      })
      .catch(() => setItems([]))
  }

  useEffect(() => {
    load(0)
  }, [])

  function openInvoice(b: AdminBooking) {
    const paid = b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED'
    if (!paid) return
    setInvoice({
      id: b.id,
      user: b.hoTen || 'Khách vãng lai',
      tour: b.tieuDeTour || `Tour #${b.idChuyenDi}`,
      people: b.soLuong ?? 1,
      total: Number(b.tongGia ?? b.tongTien ?? 0),
      date: formatBookingDate(b),
      status: b.trangThai === 'CONFIRMED' ? 'PAID' : (b.trangThai ?? 'PAID'),
      userId: b.idNguoiDung,
      checkinToken: b.maCheckIn,
    })
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/admin" className="btn btn-sm btn-outline-dark mb-2">
            <i className="bi bi-arrow-left" /> Quay lại Dashboard
          </Link>
          <h2 className="fw-bold mb-0">Lịch sử Giao dịch & Booking</h2>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">Khách hàng</th>
                  <th className="py-3">Tour / Chuyến đi</th>
                  <th className="py-3">Số người</th>
                  <th className="py-3">Tổng tiền</th>
                  <th className="py-3">Ngày đặt</th>
                  <th className="py-3 text-center">Trạng thái</th>
                  <th className="py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => {
                  const paid = b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED'
                  return (
                    <tr key={b.id}>
                      <td className="px-4 py-3 fw-bold text-muted">#{b.id}</td>
                      <td className="py-3">
                        <div className="fw-bold">
                          {b.idNguoiDung ? (
                            <Link to={`/admin/user/${b.idNguoiDung}`} className="text-decoration-none text-primary">
                              {b.hoTen || `User #${b.idNguoiDung}`}
                            </Link>
                          ) : (
                            <span>{b.hoTen || 'Khách vãng lai'}</span>
                          )}
                        </div>
                        <div className="text-muted small">{b.email || '—'}</div>
                      </td>
                      <td className="py-3 fw-bold text-primary">{b.tieuDeTour || `Tour #${b.idChuyenDi}`}</td>
                      <td className="py-3">
                        <span className="badge bg-dark rounded-pill px-3">{b.soLuong ?? 0} khách</span>
                      </td>
                      <td className="py-3 fw-bold text-danger">
                        {formatVnd(Number(b.tongGia ?? b.tongTien ?? 0))}
                      </td>
                      <td className="py-3 text-muted">{formatBookingDate(b)}</td>
                      <td className="py-3 text-center">{bookingStatusBadge(b.trangThai)}</td>
                      <td className="py-3 text-center">
                        {paid && (
                          <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-pill px-3"
                            onClick={() => openInvoice(b)}
                          >
                            <i className="bi bi-file-earmark-text me-1" />
                            Hoá đơn
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-0 py-3">
          <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
        </div>
      </div>

      {invoice && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold mb-0">Chi tiết Hoá đơn</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setInvoice(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div className="display-6 fw-bold text-dark">{formatVnd(invoice.total)}</div>
                  <div
                    className={`badge rounded-pill px-3 py-1 mt-2 ${
                      invoice.status === 'PAID' ? 'bg-success' : invoice.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger'
                    }`}
                  >
                    {invoice.status === 'PAID' ? 'Thành công' : invoice.status === 'PENDING' ? 'Chờ thanh toán' : 'Thất bại'}
                  </div>
                </div>

                {invoice.checkinToken && (
                  <div className="text-center mb-4">
                    <p className="small text-muted mb-2">
                      <i className="bi bi-qr-code me-1" /> QR check-in
                    </p>
                    <img
                      src={`/api/check-in/${encodeURIComponent(invoice.checkinToken)}/qr?size=160`}
                      alt="QR check-in"
                      className="border rounded-3 p-2 bg-white"
                      style={{ width: 160, height: 160, objectFit: 'contain' }}
                    />
                    <div className="mt-2">
                      <Link
                        to={`/check-in/${invoice.checkinToken}`}
                        target="_blank"
                        className="btn btn-sm btn-outline-warning"
                      >
                        <i className="bi bi-box-arrow-up-right me-1" /> Mở trang check-in
                      </Link>
                    </div>
                  </div>
                )}

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Mã đơn hàng:</span>
                    <span className="fw-bold">#{invoice.id}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-muted">Người đặt:</span>
                    <span className="fw-bold">
                      {invoice.user}
                      {invoice.userId && (
                        <Link to={`/admin/user/${invoice.userId}`} className="btn btn-sm btn-link p-0 ms-1" title="Xem hồ sơ">
                          <i className="bi bi-box-arrow-up-right" />
                        </Link>
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <span className="text-muted d-block mb-1">Tên Tour:</span>
                    <div className="fw-bold text-primary fs-5">{invoice.tour}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Số lượng người:</span>
                    <span className="fw-bold">{invoice.people} người</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Ngày đặt:</span>
                    <span className="fw-bold">{invoice.date}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phương thức:</span>
                    <span className="fw-bold">Chuyển khoản / VNPay</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-dark rounded-pill w-100 py-2" onClick={() => setInvoice(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
