import { useEffect, useRef, useState } from 'react'
import { getDashboardDefaults, getDashboardKpis, getMonthlyRevenue } from '../../api/adminDashboard'
import { formatVnd } from '../../utils/format'

export function AdminRevenuePage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [years, setYears] = useState<number[]>([])
  const [total, setTotal] = useState(0)
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const inst = useRef<any>(null)

  useEffect(() => {
    getDashboardDefaults().then((r) => {
      setYears(r.data.years ?? [])
      setYear(r.data.currentYear ?? new Date().getFullYear())
    }).catch(() => {})
    getDashboardKpis().then((r) => setTotal(Number(r.data.totalRevenue ?? 0))).catch(() => {})
  }, [])

  useEffect(() => {
    getMonthlyRevenue(year).then((r) => {
      const ctx = chartRef.current?.getContext('2d')
      if (!ctx || !window.Chart) return
      inst.current?.destroy?.()
      inst.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: r.data.labels,
          datasets: [{ label: 'Doanh thu', data: r.data.data, backgroundColor: '#FECF2F' }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { ticks: { callback: (v: any) => `${Number(v).toLocaleString('vi-VN')} ₫` } } },
        },
      })
    }).catch(() => {})
    return () => inst.current?.destroy?.()
  }, [year])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Báo cáo doanh thu</h2>
        <select className="form-select form-select-sm" style={{ width: 140 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {(years.length ? years : [year, year - 1]).map((y) => <option key={y} value={y}>Năm {y}</option>)}
        </select>
      </div>
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h6 className="text-muted">Tổng doanh thu (tất cả thời gian)</h6>
          <h2 className="fw-bold text-success">{formatVnd(total)}</h2>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4" style={{ height: 480 }}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  )
}
