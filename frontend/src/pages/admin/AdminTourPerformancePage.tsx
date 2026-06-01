import { Fragment, useEffect, useState } from 'react'
import { getTopTours, getTourBookings } from '../../api/adminDashboard'
import { formatVnd } from '../../utils/format'

export function AdminTourPerformancePage() {
  const [rows, setRows] = useState<Array<{ tourId: number; tourTitle: string; bookings: number; revenue: number }>>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [customers, setCustomers] = useState<Array<any>>([])

  useEffect(() => {
    getTopTours().then((r) => setRows(r.data ?? [])).catch(() => setRows([]))
  }, [])

  async function toggle(tourId: number) {
    if (expanded === tourId) {
      setExpanded(null)
      return
    }
    setExpanded(tourId)
    try {
      const r = await getTourBookings(tourId)
      setCustomers(r.data ?? [])
    } catch {
      setCustomers([])
    }
  }

  return (
    <div className="container-fluid px-0">
      <h2 className="fw-bold mb-4">Hiệu suất Tour</h2>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">#</th>
                <th>Tour</th>
                <th>Lượt đặt</th>
                <th>Doanh thu</th>
                <th className="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <Fragment key={row.tourId}>
                  <tr>
                    <td className="px-4">{idx + 1}</td>
                    <td className="fw-bold">{row.tourTitle}</td>
                    <td>{row.bookings}</td>
                    <td className="text-success fw-bold">{formatVnd(Number(row.revenue))}</td>
                    <td className="text-center">
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => toggle(row.tourId)}>
                        {expanded === row.tourId ? 'Thu gọn' : 'Xem khách'}
                      </button>
                    </td>
                  </tr>
                  {expanded === row.tourId && (
                    <tr>
                      <td colSpan={5} className="bg-light">
                        <table className="table table-sm mb-0">
                          <thead><tr><th>Booking</th><th>Tên</th><th>Email</th><th>SL</th><th>Tổng</th></tr></thead>
                          <tbody>
                            {customers.map((c: any) => (
                              <tr key={c.bookingId}>
                                <td>{c.bookingId}</td>
                                <td>{c.userName || '-'}</td>
                                <td>{c.email || '-'}</td>
                                <td>{c.quantity}</td>
                                <td>{c.total != null ? formatVnd(Number(c.total)) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted">Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
