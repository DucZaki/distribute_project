import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteAdminUser,
  getAdminUser,
  getUserBookings,
  getUserDetailStats,
  getUserMonthlySpending,
  type AdminUser,
  type UserBookingRow,
  type UserDetailStats,
} from '../../api/adminUsers'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { createRevenueLineChart } from '../../utils/adminRevenueChart'
import { formatVnd } from '../../utils/format'

type InvoiceData = {
  id: number
  tour: string
  total: number
  people: number
  date: string
  status: string
}

function userInitial(name?: string) {
  return ((name ?? 'U').trim().charAt(0) || 'U').toUpperCase()
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('vi-VN')
  } catch {
    return iso
  }
}

function bookingStatusBadge(status?: string) {
  if (status === 'PAID' || status === 'CONFIRMED') {
    return <span className="badge bg-success rounded-pill px-3 py-2">Thành công</span>
  }
  if (status === 'PENDING') {
    return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Chờ thanh toán</span>
  }
  return <span className="badge bg-danger rounded-pill px-3 py-2">Thất bại</span>
}

function tierBadges(spending: number) {
  if (spending >= 50_000_000) {
    return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Hạng Kim Cương</span>
  }
  if (spending >= 20_000_000) {
    return <span className="badge bg-info text-dark rounded-pill px-3 py-2">Hạng Vàng</span>
  }
  return null
}

export function AdminUserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = Number(id)
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInst = useRef<any>(null)
  const year = new Date().getFullYear()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [stats, setStats] = useState<UserDetailStats | null>(null)
  const [bookings, setBookings] = useState<UserBookingRow[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [bookingFilter, setBookingFilter] = useState('')
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)

  useEffect(() => {
    if (!userId) return
    getAdminUser(userId).then((r) => setUser(r.data)).catch(() => setUser(null))
    getUserDetailStats(userId).then((r) => setStats(r.data)).catch(() => setStats(null))
    loadBookings(0)
    getUserMonthlySpending(userId, year)
      .then((r) => {
        const ctx = chartRef.current?.getContext('2d')
        if (!ctx) return
        chartInst.current?.destroy?.()
        chartInst.current = createRevenueLineChart(ctx.canvas, r.data.labels ?? [], r.data.data ?? [])
      })
      .catch(() => {})
    return () => chartInst.current?.destroy?.()
  }, [userId])

  function loadBookings(p: number) {
    getUserBookings(userId, p, 5)
      .then((r) => {
        setBookings(r.data.content ?? [])
        setPage(r.data.page ?? p)
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch(() => setBookings([]))
  }

  async function onDelete() {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    await deleteAdminUser(userId)
    navigate('/admin/user')
  }

  const filteredBookings = bookings.filter((b) =>
    (b.tieuDeTour ?? '').toLowerCase().includes(bookingFilter.trim().toLowerCase()),
  )

  const spending = Number(stats?.totalSpending ?? 0)

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/admin/user" className="text-decoration-none">Người dùng</Link>
              </li>
              <li className="breadcrumb-item active">Hồ sơ chi tiết</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-0">Hồ sơ người dùng</h2>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/admin/user/edit/${userId}`} className="btn btn-warning text-white rounded-pill px-4">
            <i className="bi bi-pencil-square me-2" />Chỉnh sửa
          </Link>
          <button type="button" className="btn btn-danger rounded-pill px-4" onClick={onDelete}>
            <i className="bi bi-trash me-2" />Xóa
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4 text-center">
              <div className="mb-3 position-relative d-inline-block">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold mx-auto"
                  style={{ width: 100, height: 100, fontSize: '2.5rem' }}
                >
                  {userInitial(user?.hoTen ?? user?.tenDangNhap)}
                </div>
                {spending >= 50_000_000 && (
                  <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-warning text-dark p-2 border border-white">
                    <i className="bi bi-star-fill" />
                  </span>
                )}
              </div>
              <h4 className="fw-bold mb-1">{user?.hoTen || '—'}</h4>
              <p className="text-muted small mb-3">@{user?.tenDangNhap}</p>
              <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <span className={`badge rounded-pill px-3 py-2 ${user?.vaiTro === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                  {user?.vaiTro}
                </span>
                {tierBadges(spending)}
              </div>
              <hr className="my-4" />
              <div className="text-start">
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Email</label>
                  <div className="fw-medium">{user?.email}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Số điện thoại</label>
                  <div className="fw-medium">{user?.number || 'Chưa cập nhật'}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Ngày tham gia</label>
                  <div className="fw-medium">{formatDate(user?.ngayTao)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Chi tiêu theo tháng ({year})</h6>
            </div>
            <div className="card-body p-3">
              <div style={{ height: 350 }}>
                <canvas ref={chartRef} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body p-4">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 d-inline-block mb-3">
                    <i className="bi bi-cart-check fs-4" />
                  </div>
                  <h6 className="text-muted mb-1 small fw-bold">Tổng Booking</h6>
                  <h3 className="fw-bold mb-0">{stats?.totalBookings ?? 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-body p-4">
                  <div className="bg-success bg-opacity-10 text-success p-3 rounded-3 d-inline-block mb-3">
                    <i className="bi bi-wallet2 fs-4" />
                  </div>
                  <h6 className="text-muted mb-1 small fw-bold">Tổng chi tiêu</h6>
                  <h3 className="fw-bold mb-0 text-success">{formatVnd(spending)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                {stats?.lastBooking ? (
                  <div className="card-body p-4">
                    <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-3 d-inline-block mb-3">
                      <i className="bi bi-airplane fs-4" />
                    </div>
                    <h6 className="text-muted mb-1 small fw-bold">Tour gần nhất</h6>
                    <div className="fw-bold text-truncate">{stats.lastBooking.tourTitle}</div>
                    <div className="text-muted small">{formatDate(stats.lastBooking.ngayDat)}</div>
                  </div>
                ) : (
                  <div className="card-body p-4 text-center text-muted d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-info-circle mb-2" />
                    <div className="small fw-bold">Chưa có tour nào</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0">Lịch sử đặt tour</h5>
              <div className="input-group input-group-sm" style={{ width: 200 }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Tìm tên tour..."
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">Mã</th>
                      <th className="py-3 border-0">Tour / Chuyến đi</th>
                      <th className="py-3 border-0">Khách</th>
                      <th className="py-3 border-0">Tổng tiền</th>
                      <th className="py-3 border-0 text-center">Trạng thái</th>
                      <th className="py-3 border-0 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="px-4 py-3 fw-bold text-muted">#{b.id}</td>
                        <td className="py-3">
                          <div className="fw-bold text-primary">{b.tieuDeTour || `Tour #${b.idChuyenDi}`}</div>
                          <div className="text-muted small">
                            <i className="bi bi-calendar-event me-1" />
                            {formatDate(b.ngayDat)}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-dark rounded-pill">{b.soLuong ?? 0} người</span>
                        </td>
                        <td className="py-3 fw-bold text-danger">{formatVnd(Number(b.tongGia ?? 0))}</td>
                        <td className="py-3 text-center">{bookingStatusBadge(b.trangThai)}</td>
                        <td className="py-3 text-center">
                          {(b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED') && (
                            <button
                              type="button"
                              className="btn btn-sm btn-light border rounded-pill px-3"
                              onClick={() =>
                                setInvoice({
                                  id: b.id,
                                  tour: b.tieuDeTour || `Tour #${b.idChuyenDi}`,
                                  total: Number(b.tongGia ?? 0),
                                  people: b.soLuong ?? 1,
                                  date: formatDate(b.ngayDat),
                                  status: b.trangThai ?? 'PAID',
                                })
                              }
                            >
                              <i className="bi bi-file-earmark-text me-1" />Hoá đơn
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">Chưa có lịch sử đặt tour.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white border-0 py-3">
              <AdminPagination page={page} totalPages={totalPages} onPage={loadBookings} />
            </div>
          </div>
        </div>
      </div>

      {invoice && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold mb-0">Hóa đơn thanh toán</h5>
                <button type="button" className="btn-close" onClick={() => setInvoice(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="p-3 border rounded-3 text-center mb-4">
                  <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Tổng tiền thanh toán</label>
                  <h3 className="fw-bold text-danger mb-0">{formatVnd(invoice.total)}</h3>
                  <div className="mt-2">{bookingStatusBadge(invoice.status)}</div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="text-muted small fw-bold mb-1 d-block">Mã booking</label>
                    <div className="fw-bold">#{invoice.id}</div>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small fw-bold mb-1 d-block">Ngày đặt</label>
                    <div className="fw-bold">{invoice.date}</div>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small fw-bold mb-1 d-block">Tour</label>
                    <div className="fw-bold text-primary">{invoice.tour}</div>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small fw-bold mb-1 d-block">Số lượng khách</label>
                    <div className="fw-bold">{invoice.people} khách</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-dark w-100 rounded-pill py-2" onClick={() => setInvoice(null)}>
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
