import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardKpis, getTopTours } from '../../api/adminDashboard'
import { formatVnd } from '../../utils/format'
import { createTourPerformanceChart } from '../../utils/adminRevenueChart'

export function AdminTourPerformancePage() {
  const [rows, setRows] = useState<Array<{ tourId: number; tourTitle: string; bookings: number; revenue: number }>>([])
  const [kpis, setKpis] = useState({
    totalBookings: 0,
    successBookings: 0,
    pendingBookings: 0,
    failedBookings: 0,
  })
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInst = useRef<any>(null)

  useEffect(() => {
    getDashboardKpis()
      .then((r) => {
        const d = r.data
        setKpis({
          totalBookings: Number(d.totalBookings ?? 0),
          successBookings: Number(d.successBookings ?? 0),
          pendingBookings: Number(d.pendingBookings ?? 0),
          failedBookings: Number(d.failedBookings ?? 0),
        })
      })
      .catch(() => {})
    getTopTours()
      .then((r) => setRows(r.data ?? []))
      .catch(() => setRows([]))
  }, [])

  const maxBookings = rows.reduce((m, r) => Math.max(m, Number(r.bookings)), 0)
  const successRate =
    kpis.totalBookings > 0 ? ((kpis.successBookings * 100) / kpis.totalBookings).toFixed(1) : '0'

  useEffect(() => {
    const labels = rows.map((r) => r.tourTitle)
    const bookings = rows.map((r) => Number(r.bookings))
    const revenues = rows.map((r) => Number(r.revenue))
    const canvas = chartRef.current
    if (!canvas || !labels.length) return
    chartInst.current?.destroy?.()
    chartInst.current = createTourPerformanceChart(canvas, labels, bookings, revenues)
    return () => chartInst.current?.destroy?.()
  }, [rows])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/admin" className="btn btn-sm btn-outline-dark mb-2">
            <i className="bi bi-arrow-left" /> Quay lại Dashboard
          </Link>
          <h2 className="fw-bold mb-0">Hiệu suất Tour & Bán hàng</h2>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Lượt đặt & Doanh thu theo Tour</h5>
              <p className="text-muted small mb-0">Top tour đã thanh toán (PAID)</p>
            </div>
            <div className="card-body">
              {rows.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bar-chart fs-1 d-block mb-2" />
                  Chưa có dữ liệu bán hàng.
                </div>
              ) : (
                <div style={{ height: 380 }}>
                  <canvas ref={chartRef} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Tỷ lệ Trạng thái Booking</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-success">{successRate}%</h2>
                <p className="text-muted mb-0">Tỷ lệ thanh toán thành công</p>
              </div>
              <div className="px-2">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Thành công (PAID)</span>
                  <span className="small fw-bold text-success">{kpis.successBookings}</span>
                </div>
                <div className="progress mb-3" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${kpis.totalBookings > 0 ? (kpis.successBookings * 100) / kpis.totalBookings : 0}%`,
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Chờ / khác</span>
                  <span className="small fw-bold">{kpis.pendingBookings}</span>
                </div>
                <div className="progress mb-3" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${kpis.totalBookings > 0 ? (kpis.pendingBookings * 100) / kpis.totalBookings : 0}%`,
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Thất bại</span>
                  <span className="small fw-bold text-danger">{kpis.failedBookings}</span>
                </div>
                <div className="progress mb-2" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${kpis.totalBookings > 0 ? (kpis.failedBookings * 100) / kpis.totalBookings : 0}%`,
                    }}
                  />
                </div>
                <div className="text-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Tổng đơn: </span>
                  <span className="fw-bold">{kpis.totalBookings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="fw-bold mb-0">Bảng xếp hạng hiệu suất Tour</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Xếp hạng</th>
                  <th className="py-3">Tên Tour</th>
                  <th className="py-3 text-center">Số lượt đặt</th>
                  <th className="py-3 text-end">Doanh thu</th>
                  <th className="py-3 text-center">Hiệu suất bán</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.tourId}>
                    <td className="px-4 py-3 fw-bold text-muted">
                      {idx === 0 ? (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-trophy-fill" /> TOP 1
                        </span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="py-3 fw-bold">{row.tourTitle}</td>
                    <td className="py-3 text-center">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {row.bookings} lượt
                      </span>
                    </td>
                    <td className="py-3 text-end fw-bold text-success">{formatVnd(Number(row.revenue))}</td>
                    <td className="py-3 text-center" style={{ width: 200 }}>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${maxBookings > 0 ? (Number(row.bookings) * 100) / maxBookings : 0}%`,
                            backgroundColor: '#FECF2F',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Chưa có tour nào được đặt thành công.
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
