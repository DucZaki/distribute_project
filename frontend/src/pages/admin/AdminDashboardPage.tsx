import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminSummaryStats,
  getBookingStatusDistribution,
  getDashboardDefaults,
  getDashboardKpis,
  getMonthlyRevenue,
  getRecentBookings,
  getTopTours,
  getTourBookings,
  getUserSpending,
  type AdminSummaryStats,
  type DashboardKpis,
  type RecentBooking,
} from '../../api/adminDashboard'
import { formatVnd } from '../../utils/format'

declare global {
  interface Window {
    Chart: any
    bootstrap: any
  }
}

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [years, setYears] = useState<number[]>([])
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [topTours, setTopTours] = useState<Array<{ tourId: number; tourTitle: string; bookings: number; revenue: number }>>([])
  const [userSpending, setUserSpending] = useState<Array<{ userId: number; name: string; email: string; purchases: number; spending: number }>>([])
  const revenueChartRef = useRef<HTMLCanvasElement | null>(null)
  const statusChartRef = useRef<HTMLCanvasElement | null>(null)
  const revenueChartInst = useRef<any>(null)
  const statusChartInst = useRef<any>(null)
  const [tourCustomers, setTourCustomers] = useState<Array<any>>([])
  const [tourModal, setTourModal] = useState<{ tourId: number; tourName: string } | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [summaryStats, setSummaryStats] = useState<AdminSummaryStats | null>(null)

  useEffect(() => {
    getDashboardDefaults()
      .then((r) => {
        setYears(r.data.years ?? [])
        setYear(r.data.currentYear ?? new Date().getFullYear())
      })
      .catch(() => {})
    getDashboardKpis().then((r) => setKpis(r.data)).catch(() => setKpis(null))
    getTopTours().then((r) => setTopTours(r.data ?? [])).catch(() => setTopTours([]))
    getUserSpending().then((r) => setUserSpending(r.data ?? [])).catch(() => setUserSpending([]))
    getRecentBookings(10).then((r) => setRecentBookings(r.data ?? [])).catch(() => setRecentBookings([]))
    getAdminSummaryStats().then((r) => setSummaryStats(r.data)).catch(() => setSummaryStats(null))
  }, [])

  const revenueTrend = kpis?.revenueGrowthPercent ?? 0
  const revenueTrendLabel =
    revenueTrend > 0 ? `+${revenueTrend}%` : revenueTrend < 0 ? `${revenueTrend}%` : '0%'

  useEffect(() => {
    getMonthlyRevenue(year)
      .then((r) => {
        const ctx = revenueChartRef.current?.getContext('2d')
        if (!ctx || !window.Chart) return
        revenueChartInst.current?.destroy?.()
        revenueChartInst.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: r.data.labels,
            datasets: [{
              label: `Doanh thu ${r.data.year}`,
              data: r.data.data,
              borderColor: '#FECF2F',
              backgroundColor: 'rgba(254,207,47,0.25)',
              tension: 0.35,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { callback: (v: any) => `${Number(v).toLocaleString('vi-VN')} ₫` } },
            },
          },
        })
      })
      .catch(() => {})

    getBookingStatusDistribution()
      .then((r) => {
        const ctx = statusChartRef.current?.getContext('2d')
        if (!ctx || !window.Chart) return
        statusChartInst.current?.destroy?.()
        statusChartInst.current = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: r.data.labels,
            datasets: [{ data: r.data.data, backgroundColor: ['#FECF2F', '#198754', '#dc3545', '#0dcaf0', '#6c757d'] }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
        })
      })
      .catch(() => {})

    return () => {
      revenueChartInst.current?.destroy?.()
      statusChartInst.current?.destroy?.()
    }
  }, [year])

  async function openTourCustomers(tourId: number, tourName: string) {
    setTourModal({ tourId, tourName })
    try {
      const r = await getTourBookings(tourId)
      setTourCustomers(r.data ?? [])
    } catch {
      setTourCustomers([])
    }
    const el = document.getElementById('tourCustomersModal')
    if (el && window.bootstrap) new window.bootstrap.Modal(el).show()
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Hệ thống Thống kê</h2>
        <div className="text-muted">{new Date().toLocaleString('vi-VN')}</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Link to="/admin/revenue" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-primary border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 text-dark p-3 rounded-3">
                    <i className="bi bi-currency-dollar fs-4" />
                  </div>
                  <span className={`badge small ${revenueTrend >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {revenueTrendLabel} tháng này
                  </span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold">Doanh thu tổng</h6>
                <h3 className="fw-bold mb-0 text-dark">{formatVnd(Number(kpis?.totalRevenue ?? 0))}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/bookings" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-success border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-success bg-opacity-10 text-dark p-3 rounded-3">
                    <i className="bi bi-cart-check fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">{(kpis?.successBookings ?? 0) + ' thành công'}</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold">Tổng số Booking</h6>
                <h3 className="fw-bold mb-0 text-dark">{kpis?.totalBookings ?? 0}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/tour-performance" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-warning border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-warning bg-opacity-10 text-dark p-3 rounded-3">
                    <i className="bi bi-airplane-engines fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">{(kpis?.totalTours ?? 0) + ' tour'}</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold">Tỷ lệ thành công</h6>
                <h3 className="fw-bold mb-0 text-dark">{kpis?.successRate ?? 0}%</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/user" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-info border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-info bg-opacity-10 text-dark p-3 rounded-3">
                    <i className="bi bi-people fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">Khách hàng</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold">Tổng người dùng</h6>
                <h3 className="fw-bold mb-0 text-dark">{kpis?.totalUsers ?? 0}</h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link to="/admin/bookings?trangThai=PENDING" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Booking chờ xử lý</div>
                <div className="fs-3 fw-bold text-warning">{kpis?.pendingBookings ?? 0}</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/contact" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Liên hệ mới</div>
                <div className="fs-3 fw-bold text-primary">{summaryStats?.pendingContacts ?? 0}</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/danh-gia" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Tổng đánh giá</div>
                <div className="fs-3 fw-bold text-dark">{summaryStats?.totalReviews ?? 0}</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Doanh thu theo tháng ({year})</h5>
              <select className="form-select form-select-sm" style={{ width: 140 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {(years.length ? years : [year, year - 1, year - 2, year - 3]).map((y) => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
            <div className="card-body p-4" style={{ height: 450 }}>
              <canvas ref={revenueChartRef} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="fw-bold mb-0">Trạng thái đặt chỗ</h5>
            </div>
            <div className="card-body p-4 d-flex align-items-center" style={{ height: 450 }}>
              <canvas ref={statusChartRef} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0"><i className="bi bi-clock-history me-2" />Đặt chỗ gần đây</h5>
              <Link to="/admin/bookings" className="btn btn-sm btn-outline-dark">Xem tất cả</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">#</th>
                      <th className="py-3 border-0">Tour</th>
                      <th className="py-3 border-0">Khách</th>
                      <th className="py-3 border-0">Tổng</th>
                      <th className="py-3 border-0">Trạng thái</th>
                      <th className="py-3 border-0">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.bookingId}>
                        <td className="px-4 py-3 border-0 fw-bold">#{b.bookingId}</td>
                        <td className="py-3 border-0">
                          <Link to={`/tour/${b.tourId}`} className="fw-semibold text-decoration-none">{b.tourTitle}</Link>
                        </td>
                        <td className="py-3 border-0">
                          <div className="fw-semibold">{b.userName || `User #${b.userId}`}</div>
                          <div className="text-muted small">{b.email || '-'}</div>
                        </td>
                        <td className="py-3 border-0 fw-bold">{b.total != null ? formatVnd(Number(b.total)) : '-'}</td>
                        <td className="py-3 border-0"><span className="badge bg-secondary">{b.status}</span></td>
                        <td className="py-3 border-0 text-muted small">{b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : '-'}</td>
                      </tr>
                    ))}
                    {recentBookings.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-4 text-muted">Chưa có đặt chỗ.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="fw-bold mb-0"><i className="bi bi-trophy-fill text-warning me-2" />Top Tour bán chạy</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">#</th>
                      <th className="py-3 border-0">Tên Tour</th>
                      <th className="py-3 border-0">Số lượt đặt</th>
                      <th className="py-3 border-0">Doanh thu</th>
                      <th className="py-3 border-0 text-center">Chi tiết khách hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTours.map((row, idx) => (
                      <tr key={row.tourId}>
                        <td className="px-4 py-3 border-0 fw-bold text-muted">{idx + 1}</td>
                        <td className="py-3 border-0 fw-bold">{row.tourTitle}</td>
                        <td className="py-3 border-0">
                          <span className="badge bg-dark text-white px-3 py-2 rounded-pill fw-bold">{row.bookings} lượt</span>
                        </td>
                        <td className="py-3 border-0 fw-bold text-success">{formatVnd(Number(row.revenue ?? 0))}</td>
                        <td className="py-3 border-0 text-center">
                          <button type="button" className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => openTourCustomers(row.tourId, row.tourTitle)}>
                            <i className="bi bi-people-fill me-1" />Xem khách
                          </button>
                        </td>
                      </tr>
                    ))}
                    {topTours.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-5 text-muted">Chưa có dữ liệu đặt chỗ nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="fw-bold mb-0"><i className="bi bi-person-check-fill text-primary me-2" />Chi tiêu của khách hàng</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">#</th>
                      <th className="py-3 border-0">Tên khách hàng</th>
                      <th className="py-3 border-0">Email</th>
                      <th className="py-3 border-0">Số lượt mua</th>
                      <th className="py-3 border-0">Tổng chi tiêu</th>
                      <th className="py-3 border-0 text-center">Hạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSpending.map((row, idx) => (
                      <tr key={row.userId}>
                        <td className="px-4 py-3 border-0 fw-bold text-muted">{idx + 1}</td>
                        <td className="py-3 border-0 fw-bold">{row.name || 'Khách vãng lai'}</td>
                        <td className="py-3 border-0 text-muted small">{row.email || '-'}</td>
                        <td className="py-3 border-0"><span className="badge bg-secondary px-3 py-2 rounded-pill">{row.purchases} lượt</span></td>
                        <td className="py-3 border-0 fw-bold text-danger">{formatVnd(Number(row.spending ?? 0))}</td>
                        <td className="py-3 border-0 text-center">
                          {Number(row.spending ?? 0) >= 100000000 ? <span className="tier-badge tier-diamond">👑 Kim Cương</span>
                            : Number(row.spending ?? 0) >= 50000000 ? <span className="tier-badge tier-platinum">💎 Bạch Kim</span>
                              : Number(row.spending ?? 0) >= 20000000 ? <span className="tier-badge tier-gold">🥇 Vàng</span>
                                : Number(row.spending ?? 0) >= 10000000 ? <span className="tier-badge tier-silver">🥈 Bạc</span>
                                  : <span className="tier-badge tier-bronze">🥉 Đồng</span>}
                        </td>
                      </tr>
                    ))}
                    {userSpending.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-5 text-muted">Chưa có dữ liệu.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="tourCustomersModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header" style={{ background: '#FECF2F' }}>
              <h5 className="modal-title fw-bold">Khách hàng: {tourModal?.tourName}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng" />
            </div>
            <div className="modal-body">
              <table className="table table-sm align-middle">
                <thead>
                  <tr><th>#</th><th>Tên</th><th>Email</th><th>SL</th><th>Tổng</th><th>Ngày</th></tr>
                </thead>
                <tbody>
                  {tourCustomers.map((c: any) => (
                    <tr key={c.bookingId}>
                      <td>{c.bookingId}</td>
                      <td>{c.userName || '-'}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.quantity ?? '-'}</td>
                      <td>{c.total != null ? formatVnd(Number(c.total)) : '-'}</td>
                      <td>{c.createdAt ? String(c.createdAt) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
