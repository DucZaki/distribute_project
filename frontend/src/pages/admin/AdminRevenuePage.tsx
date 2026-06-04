import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardDefaults, getRecentBookings, getRevenueDetail } from '../../api/adminDashboard'
import { formatVnd } from '../../utils/format'
import { createRevenueLineChart } from '../../utils/adminRevenueChart'

type TabId = 'month' | 'week' | 'year'

function formatDate(s?: string) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('vi-VN')
  } catch {
    return s
  }
}

export function AdminRevenuePage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [years, setYears] = useState<number[]>([])
  const [total, setTotal] = useState(0)
  const [tab, setTab] = useState<TabId>('month')
  const [monthly, setMonthly] = useState({ labels: [] as string[], data: [] as number[], rows: [] as Array<{ period: number; amount: number }> })
  const [weekly, setWeekly] = useState({ labels: [] as string[], data: [] as number[], rows: [] as Array<{ period: number; amount: number }> })
  const [yearly, setYearly] = useState({ labels: [] as string[], data: [] as number[], rows: [] as Array<{ period: number; amount: number }> })
  const [transactions, setTransactions] = useState<Array<{
    bookingId?: number
    userName?: string
    userId?: number
    tourTitle?: string
    total?: number
    status?: string
    createdAt?: string
  }>>([])

  const monthChartRef = useRef<HTMLCanvasElement | null>(null)
  const weekChartRef = useRef<HTMLCanvasElement | null>(null)
  const yearChartRef = useRef<HTMLCanvasElement | null>(null)
  const charts = useRef<Record<string, any>>({})

  useEffect(() => {
    getDashboardDefaults()
      .then((r) => {
        setYears(r.data.years ?? [])
        setYear(r.data.currentYear ?? new Date().getFullYear())
      })
      .catch(() => {})
    getRecentBookings(30)
      .then((r) => setTransactions(r.data ?? []))
      .catch(() => setTransactions([]))
  }, [])

  useEffect(() => {
    getRevenueDetail(year)
      .then((r) => {
        const d = r.data
        setTotal(Number(d.totalRevenue ?? 0))
        setMonthly({
          labels: d.monthlyLabels ?? d.labels ?? [],
          data: (d.monthlyData ?? d.data ?? []).map(Number),
          rows: d.monthlyRows ?? [],
        })
        setWeekly({
          labels: d.weeklyLabels ?? [],
          data: (d.weeklyData ?? []).map(Number),
          rows: d.weeklyRows ?? [],
        })
        setYearly({
          labels: d.yearlyLabels ?? [],
          data: (d.yearlyData ?? []).map(Number),
          rows: d.yearlyRows ?? [],
        })
      })
      .catch(() => {})
  }, [year])

  function ensureChart(key: TabId, canvas: HTMLCanvasElement | null, labels: string[], data: number[]) {
    if (!canvas || !labels.length) return
    if (charts.current[key]) {
      charts.current[key].resize()
      return
    }
    charts.current[key] = createRevenueLineChart(canvas, labels, data)
  }

  useEffect(() => {
    charts.current = {}
  }, [year])

  useEffect(() => {
    if (tab === 'month') ensureChart('month', monthChartRef.current, monthly.labels, monthly.data)
    if (tab === 'week') ensureChart('week', weekChartRef.current, weekly.labels, weekly.data)
    if (tab === 'year') ensureChart('year', yearChartRef.current, yearly.labels, yearly.data)
  }, [tab, year, monthly, weekly, yearly])

  const activeRows =
    tab === 'month' ? monthly.rows : tab === 'week' ? weekly.rows : yearly.rows
  const periodLabel = tab === 'month' ? 'Tháng' : tab === 'week' ? 'Tuần' : 'Năm'

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <Link to="/admin" className="btn btn-sm btn-outline-dark mb-2">
            <i className="bi bi-arrow-left" /> Quay lại Dashboard
          </Link>
          <h2 className="fw-bold mb-0">Thống kê Doanh thu</h2>
        </div>
        <div className="text-end">
          <h3 className="text-success fw-bold mb-0">{formatVnd(total)}</h3>
          <span className="text-muted small">Tổng doanh thu hệ thống (PAID)</span>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <ul className="nav nav-pills" role="tablist">
            {(['month', 'week', 'year'] as TabId[]).map((id) => (
              <li className="nav-item" key={id} role="presentation">
                <button
                  type="button"
                  className={`nav-link${tab === id ? ' active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  {id === 'month' ? 'Theo Tháng' : id === 'week' ? 'Theo Tuần' : 'Theo Năm'}
                </button>
              </li>
            ))}
          </ul>
          <form
            className="d-flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <select
              className="form-select form-select-sm"
              style={{ width: 150 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {(years.length ? years : [year, year - 1, year - 2]).map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setYear(year)}>
              Lọc
            </button>
          </form>
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-8">
              <div style={{ height: 400 }}>
                {tab === 'month' && <canvas ref={monthChartRef} />}
                {tab === 'week' && <canvas ref={weekChartRef} />}
                {tab === 'year' && <canvas ref={yearChartRef} />}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="table-responsive" style={{ maxHeight: 700, overflowY: 'auto' }}>
                <table className="table table-hover">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th>{periodLabel}</th>
                      <th className="text-end">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRows.map((row) => (
                      <tr key={`${tab}-${row.period}`}>
                        <td>
                          <div className="fw-bold">
                            {periodLabel} {row.period}
                          </div>
                          <div className="small text-muted">
                            {tab === 'year' ? 'Tổng hợp' : `Năm ${year}`}
                          </div>
                        </td>
                        <td className="text-end fw-bold text-dark">{formatVnd(Number(row.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">Chi tiết giao dịch gần đây</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0">ID</th>
                  <th className="py-3 border-0">Khách hàng</th>
                  <th className="py-3 border-0">Tour</th>
                  <th className="py-3 border-0 text-end">Số tiền</th>
                  <th className="py-3 border-0">Ngày</th>
                  <th className="py-3 border-0 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((row) => (
                  <tr key={row.bookingId}>
                    <td className="px-4 py-3 text-muted fw-bold">#{row.bookingId}</td>
                    <td className="py-3">
                      {row.userId ? (
                        <Link
                          to={`/admin/user/${row.userId}`}
                          className="text-decoration-none text-dark fw-bold border-bottom border-warning"
                        >
                          {row.userName || 'Khách'}
                        </Link>
                      ) : (
                        <span>{row.userName || 'Khách vãng lai'}</span>
                      )}
                    </td>
                    <td className="py-3 fw-bold text-dark">{row.tourTitle || '—'}</td>
                    <td className="py-3 text-end fw-bold text-success">{formatVnd(Number(row.total ?? 0))}</td>
                    <td className="py-3 small text-muted">{formatDate(row.createdAt)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`badge rounded-pill ${row.status === 'PAID' ? 'bg-success' : 'bg-danger'}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Chưa có giao dịch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
