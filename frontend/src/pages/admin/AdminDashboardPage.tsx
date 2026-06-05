import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getBookingStatusDistribution,
  getDashboardDefaults,
  getDashboardKpis,
  getMonthlyRevenue,
  getTopTours,
  getTourBookings,
  getUserSpending,
  type DashboardKpis,
} from '../../api/adminDashboard'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

const TABLE_PAGE_SIZE = 3

type TopTour = { tourId: number; tourTitle: string; bookings: number; revenue: number }
type UserSpend = { userId: number; name: string; email: string; purchases: number; spending: number }
type TourCustomer = {
  bookingId: number
  userId?: number
  userName?: string
  email?: string
  quantity?: number
  total?: number
  createdAt?: string
}

type TopTourSort = 'bookings' | 'revenue'
type UserSpendSort = 'spending_desc' | 'spending_asc' | 'purchases_desc' | 'name_asc'

function tierBadge(spending: number) {
  if (spending >= 100_000_000) return <span className="tier-badge tier-diamond">👑 Kim Cương</span>
  if (spending >= 50_000_000) return <span className="tier-badge tier-platinum">💎 Bạch Kim</span>
  if (spending >= 20_000_000) return <span className="tier-badge tier-gold">🥇 Vàng</span>
  if (spending >= 10_000_000) return <span className="tier-badge tier-silver">🥈 Bạc</span>
  return <span className="tier-badge tier-bronze">🥉 Đồng</span>
}

function userInitial(name?: string) {
  const n = (name || 'K').trim()
  return n.charAt(0).toUpperCase()
}

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [years, setYears] = useState<number[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [topTours, setTopTours] = useState<TopTour[]>([])
  const [userSpending, setUserSpending] = useState<UserSpend[]>([])
  const [loadErr, setLoadErr] = useState('')
  const [topTourSort, setTopTourSort] = useState<TopTourSort>('bookings')
  const [userSort, setUserSort] = useState<UserSpendSort>('spending_desc')
  const [topTourPage, setTopTourPage] = useState(0)
  const [userSpendPage, setUserSpendPage] = useState(0)

  const revenueChartRef = useRef<HTMLCanvasElement | null>(null)
  const statusChartRef = useRef<HTMLCanvasElement | null>(null)
  const revenueChartInst = useRef<InstanceType<NonNullable<typeof window.Chart>> | null>(null)
  const statusChartInst = useRef<InstanceType<NonNullable<typeof window.Chart>> | null>(null)

  const [tourModal, setTourModal] = useState<{ tourId: number; tourName: string } | null>(null)
  const [tourCustomers, setTourCustomers] = useState<TourCustomer[]>([])
  const [tourModalLoading, setTourModalLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const modalInst = useRef<{ show: () => void; hide: () => void } | null>(null)

  useEffect(() => {
    setLoadErr('')
    Promise.all([
      getDashboardDefaults().then((r) => {
        setYears(r.data.years ?? [])
        setYear(r.data.currentYear ?? new Date().getFullYear())
      }),
      getDashboardKpis().then((r) => setKpis(r.data)),
      getTopTours().then((r) => setTopTours(r.data ?? [])),
      getUserSpending().then((r) => setUserSpending(r.data ?? [])),
    ]).catch((err: unknown) => {
      setLoadErr(err instanceof Error ? err.message : 'Không tải được dữ liệu dashboard')
    })
  }, [])

  const sortedTopTours = useMemo(() => {
    const list = topTours.filter((t) => Number(t.revenue) > 0)
    list.sort((a, b) =>
      topTourSort === 'revenue'
        ? Number(b.revenue) - Number(a.revenue)
        : Number(b.bookings) - Number(a.bookings),
    )
    return list
  }, [topTours, topTourSort])

  const sortedUserSpending = useMemo(() => {
    const list = userSpending.filter((u) => Number(u.spending) > 0)
    list.sort((a, b) => {
      if (userSort === 'spending_asc') return Number(a.spending) - Number(b.spending)
      if (userSort === 'purchases_desc') return Number(b.purchases) - Number(a.purchases)
      if (userSort === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'vi')
      return Number(b.spending) - Number(a.spending)
    })
    return list
  }, [userSpending, userSort])

  const topTourTotalPages = Math.max(1, Math.ceil(sortedTopTours.length / TABLE_PAGE_SIZE))
  const userSpendTotalPages = Math.max(1, Math.ceil(sortedUserSpending.length / TABLE_PAGE_SIZE))

  const paginatedTopTours = useMemo(
    () => sortedTopTours.slice(topTourPage * TABLE_PAGE_SIZE, topTourPage * TABLE_PAGE_SIZE + TABLE_PAGE_SIZE),
    [sortedTopTours, topTourPage],
  )

  const paginatedUserSpending = useMemo(
    () =>
      sortedUserSpending.slice(
        userSpendPage * TABLE_PAGE_SIZE,
        userSpendPage * TABLE_PAGE_SIZE + TABLE_PAGE_SIZE,
      ),
    [sortedUserSpending, userSpendPage],
  )

  useEffect(() => {
    setTopTourPage(0)
  }, [topTourSort, topTours])

  useEffect(() => {
    setUserSpendPage(0)
  }, [userSort, userSpending])

  useEffect(() => {
    if (topTourPage > topTourTotalPages - 1) setTopTourPage(Math.max(0, topTourTotalPages - 1))
  }, [topTourPage, topTourTotalPages])

  useEffect(() => {
    if (userSpendPage > userSpendTotalPages - 1) setUserSpendPage(Math.max(0, userSpendTotalPages - 1))
  }, [userSpendPage, userSpendTotalPages])

  const successRate =
    kpis?.successRate ??
    (kpis && kpis.totalBookings > 0
      ? Math.round((100 * (kpis.successBookings ?? 0)) / kpis.totalBookings)
      : 0)

  useEffect(() => {
    getMonthlyRevenue(year)
      .then((r) => {
        const ctx = revenueChartRef.current?.getContext('2d')
        if (!ctx || !window.Chart) return
        revenueChartInst.current?.destroy()
        const labels = r.data.monthlyLabels ?? r.data.labels ?? []
        const data = r.data.monthlyData ?? r.data.data ?? []
        revenueChartInst.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Doanh thu (₫)',
                data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0d6efd',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { borderDash: [5, 5] },
                ticks: {
                  callback: (v) => `${Number(v).toLocaleString('vi-VN')} ₫`,
                },
              },
              x: { grid: { display: false } },
            },
          },
        })
      })
      .catch(() => {})

    getBookingStatusDistribution()
      .then((r) => {
        const ctx = statusChartRef.current?.getContext('2d')
        if (!ctx || !window.Chart) return
        statusChartInst.current?.destroy()
        statusChartInst.current = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: r.data.labels,
            datasets: [
              {
                data: r.data.data,
                backgroundColor: ['#0d6efd', '#6ea8fe', '#cfe2ff', '#e9ecef'],
                hoverOffset: 10,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 20 },
              },
            },
            cutout: '70%',
          },
        })
      })
      .catch(() => {})

    return () => {
      revenueChartInst.current?.destroy()
      statusChartInst.current?.destroy()
    }
  }, [year])

  useEffect(() => {
    if (!modalRef.current || !window.bootstrap) return
    modalInst.current = new window.bootstrap.Modal(modalRef.current)
    return () => {
      modalInst.current = null
    }
  }, [])

  async function openTourCustomers(tourId: number, tourName: string) {
    setTourModal({ tourId, tourName })
    setTourCustomers([])
    setTourModalLoading(true)
    modalInst.current?.show()
    try {
      const r = await getTourBookings(tourId)
      setTourCustomers(r.data ?? [])
    } catch {
      setTourCustomers([])
    } finally {
      setTourModalLoading(false)
    }
  }

  const tourStats = useMemo(() => {
    const totalGuests = tourCustomers.reduce((s, c) => s + (c.quantity ?? 0), 0)
    const totalRevenue = tourCustomers.reduce((s, c) => s + Number(c.total ?? 0), 0)
    return { orders: tourCustomers.length, totalGuests, totalRevenue }
  }, [tourCustomers])

  const yearOptions = years.length ? years : [year, year - 1, year - 2, year - 3]

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Hệ thống Thống kê</h2>
        <div className="text-muted">{new Date().toLocaleString('vi-VN')}</div>
      </div>

      {loadErr && <div className="alert alert-warning py-2 mb-3">{loadErr}</div>}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Link to="/admin/revenue" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-primary border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                    <i className="bi bi-currency-dollar fs-4" />
                  </div>
                  {kpis?.revenueGrowthPercent != null && (
                    <span className="badge bg-light text-primary border border-primary border-opacity-25 small">
                      {kpis.revenueGrowthPercent > 0 ? '+' : ''}
                      {kpis.revenueGrowthPercent}%
                    </span>
                  )}
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold ls-1">Doanh thu tổng</h6>
                <h3 className="fw-bold mb-0 text-dark">{formatVnd(Number(kpis?.totalRevenue ?? 0))}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/bookings" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-primary border-opacity-75 border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                    <i className="bi bi-cart-check fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">{kpis?.successBookings ?? 0} thành công</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold ls-1">Tổng số Booking</h6>
                <h3 className="fw-bold mb-0 text-dark">{kpis?.totalBookings ?? 0}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/tour-performance" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-primary border-opacity-50 border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                    <i className="bi bi-airplane-engines fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">{kpis?.totalTours ?? 0} tour</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold ls-1">Hiệu suất Tour</h6>
                <h3 className="fw-bold mb-0 text-dark">{successRate}%</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/user" className="text-decoration-none">
            <div className="card stat-card shadow-sm h-100 bg-white border-start border-primary border-opacity-25 border-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                    <i className="bi bi-people fs-4" />
                  </div>
                  <span className="text-muted small fw-bold">Khách hàng</span>
                </div>
                <h6 className="text-muted mb-1 small uppercase fw-bold ls-1">Tổng người dùng</h6>
                <h3 className="fw-bold mb-0 text-dark">{kpis?.totalUsers ?? 0}</h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Doanh thu theo tháng ({year})</h5>
              <select
                className="form-select form-select-sm"
                style={{ width: 120 }}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
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

      {/* Tables */}
      <div className="row g-4">
        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-trophy-fill text-warning me-2" />
                Top Tour bán chạy
              </h5>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm border-primary text-primary"
                  style={{ width: 'auto' }}
                  value={topTourSort}
                  onChange={(e) => setTopTourSort(e.target.value as TopTourSort)}
                >
                  <option value="bookings">Sắp xếp: Lượt đặt</option>
                  <option value="revenue">Sắp xếp: Doanh thu</option>
                </select>
                <Link to="/admin/tour/active" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  Xem tất cả
                </Link>
              </div>
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
                    {paginatedTopTours.map((row, idx) => (
                      <tr key={row.tourId}>
                        <td className="px-4 py-3 border-0 fw-bold text-muted">
                          {topTourPage * TABLE_PAGE_SIZE + idx + 1}
                        </td>
                        <td className="py-3 border-0 fw-bold">{row.tourTitle}</td>
                        <td className="py-3 border-0">
                          <span className="badge bg-dark text-white px-3 py-2 rounded-pill fw-bold">
                            {row.bookings} lượt
                          </span>
                        </td>
                        <td className="py-3 border-0 fw-bold text-success">
                          {formatVnd(Number(row.revenue ?? 0))}
                        </td>
                        <td className="py-3 border-0 text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary rounded-pill px-3"
                            onClick={() => openTourCustomers(row.tourId, row.tourTitle)}
                          >
                            <i className="bi bi-people-fill me-1" />
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sortedTopTours.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          Chưa có tour nào có doanh thu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {sortedTopTours.length > 0 && (
              <div className="card-footer bg-white border-0 py-2">
                <AdminPagination
                  page={topTourPage}
                  totalPages={topTourTotalPages}
                  onPage={setTopTourPage}
                />
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-person-check-fill text-primary me-2" />
                Chi tiêu của khách hàng
              </h5>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={userSort}
                onChange={(e) => setUserSort(e.target.value as UserSpendSort)}
              >
                <option value="spending_desc">Sắp xếp: Chi tiêu cao nhất</option>
                <option value="spending_asc">Sắp xếp: Chi tiêu thấp nhất</option>
                <option value="purchases_desc">Sắp xếp: Nhiều lượt mua</option>
                <option value="name_asc">Sắp xếp: Tên A→Z</option>
              </select>
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
                    {paginatedUserSpending.map((row, idx) => (
                      <tr key={row.userId ?? idx}>
                        <td className="px-4 py-3 border-0 fw-bold text-muted">
                          {userSpendPage * TABLE_PAGE_SIZE + idx + 1}
                        </td>
                        <td className="py-3 border-0">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center fw-bold text-primary"
                              style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                            >
                              {userInitial(row.name)}
                            </div>
                            <span className="fw-bold">{row.name || 'Khách vãng lai'}</span>
                          </div>
                        </td>
                        <td className="py-3 border-0 text-muted small">{row.email || '-'}</td>
                        <td className="py-3 border-0">
                          <span className="badge bg-dark text-white px-3 py-2 rounded-pill">
                            {row.purchases} lượt
                          </span>
                        </td>
                        <td className="py-3 border-0 fw-bold text-danger">
                          {formatVnd(Number(row.spending ?? 0))}
                        </td>
                        <td className="py-3 border-0 text-center">{tierBadge(Number(row.spending ?? 0))}</td>
                      </tr>
                    ))}
                    {sortedUserSpending.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Chưa có khách hàng có chi tiêu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {sortedUserSpending.length > 0 && (
              <div className="card-footer bg-white border-0 py-2">
                <AdminPagination
                  page={userSpendPage}
                  totalPages={userSpendTotalPages}
                  onPage={setUserSpendPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết khách hàng theo tour */}
      <div className="modal fade" id="tourCustomersModal" ref={modalRef} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 pb-0">
              <div>
                <h5 className="fw-bold mb-1">{tourModal?.tourName ?? 'Chi tiết tour'}</h5>
                <p className="text-muted small mb-0">Danh sách khách hàng đã đặt tour này</p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng" />
            </div>
            <div className="modal-body p-4">
              {tourModalLoading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted small">Đang tải dữ liệu...</p>
                </div>
              )}
              {!tourModalLoading && tourCustomers.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1" />
                  <p className="mt-2 mb-0">Chưa có khách hàng nào đặt tour này.</p>
                </div>
              )}
              {!tourModalLoading && tourCustomers.length > 0 && (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <div className="card border-0 bg-primary bg-opacity-10 rounded-3 p-3 text-center">
                        <div className="fw-bold fs-4 text-dark">{tourStats.orders}</div>
                        <div className="small text-dark">Đơn đặt</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-success bg-opacity-10 rounded-3 p-3 text-center">
                        <div className="fw-bold fs-4 text-dark">{tourStats.totalGuests}</div>
                        <div className="small text-dark">Tổng khách</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-danger bg-opacity-10 rounded-3 p-3 text-center">
                        <div className="fw-bold fs-5 text-dark">{formatVnd(tourStats.totalRevenue)}</div>
                        <div className="small text-dark">Tổng doanh thu</div>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="py-2">Tên khách</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Số khách</th>
                          <th className="py-2">Tổng tiền</th>
                          <th className="py-2">Ngày đặt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tourCustomers.map((c, i) => (
                          <tr key={c.bookingId}>
                            <td className="px-3">{i + 1}</td>
                            <td className="fw-bold">
                              {c.userId ? (
                                <Link to={`/admin/user/${c.userId}`} className="text-decoration-none text-primary">
                                  {c.userName || '-'}
                                </Link>
                              ) : (
                                c.userName || '-'
                              )}
                            </td>
                            <td className="text-muted small">{c.email || '-'}</td>
                            <td>
                              <span className="badge bg-dark text-white rounded-pill">{c.quantity ?? 0} người</span>
                            </td>
                            <td className="fw-bold text-danger">
                              {c.total != null ? formatVnd(Number(c.total)) : '0 ₫'}
                            </td>
                            <td className="text-muted small">
                              {c.createdAt ? String(c.createdAt).slice(0, 10) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
