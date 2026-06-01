import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cancelAdminBooking, listAdminBookings, type AdminBooking } from '../../api/adminBookings'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

export function AdminBookingsPage() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<AdminBooking[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState(searchParams.get('trangThai') ?? '')
  const [msg, setMsg] = useState('')

  function load(p = page) {
    listAdminBookings(status || undefined, p, 20)
      .then((r) => {
        setItems(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
        setPage(r.data.page ?? p)
      })
      .catch(() => setItems([]))
  }

  useEffect(() => {
    setStatus(searchParams.get('trangThai') ?? '')
  }, [searchParams])

  useEffect(() => { load(0) }, [status])

  async function onCancel(id: number) {
    if (!confirm('Huỷ booking này?')) return
    try {
      await cancelAdminBooking(id)
      setMsg('Đã huỷ booking')
      load()
    } catch (e: any) {
      setMsg(e.message ?? 'Lỗi')
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold mb-0">Quản lý đặt chỗ</h2>
        <select className="form-select form-select-sm" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">ID</th>
                <th>Tour</th>
                <th>User</th>
                <th>SL</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 fw-bold">#{b.id}</td>
                  <td>
                    {b.idChuyenDi ? (
                      <Link to={`/tour/${b.idChuyenDi}`} className="text-decoration-none fw-semibold">
                        {b.tieuDeTour ?? `Tour #${b.idChuyenDi}`}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="fw-semibold">{b.hoTen || `User #${b.idNguoiDung}`}</div>
                    <div className="text-muted small">{b.email || '-'}</div>
                  </td>
                  <td>{b.soLuong ?? '-'}</td>
                  <td className="fw-bold">
                    {b.tongGia != null ? formatVnd(Number(b.tongGia)) : b.tongTien != null ? formatVnd(Number(b.tongTien)) : '-'}
                  </td>
                  <td><span className="badge bg-secondary">{b.trangThai}</span></td>
                  <td className="text-center">
                    {b.trangThai !== 'CANCELLED' && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onCancel(b.id)}>Huỷ</button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="text-center py-5 text-muted">Không có booking.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
