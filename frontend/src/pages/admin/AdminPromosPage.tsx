import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePromo, listPromos, type Promo } from '../../api/adminPromos'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

export function AdminPromosPage() {
  const [items, setItems] = useState<Promo[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  function load(p = 0) {
    listPromos(p, 20).then((r) => {
      setItems(r.data.content ?? [])
      setTotalPages(r.data.totalPages ?? 0)
      setPage(r.data.page ?? p)
    }).catch(() => setItems([]))
  }

  useEffect(() => { load(0) }, [])

  async function onDelete(id: number) {
    if (!confirm('Xóa mã này?')) return
    await deletePromo(id)
    load(page)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Quản lý mã giảm giá</h2>
        <Link to="/admin/promo/create" className="btn btn-primary rounded-pill px-4">
          <i className="bi bi-plus-lg me-1" /> Thêm mã
        </Link>
      </div>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const expired =
                  (p.ngayBatDau && today < p.ngayBatDau) ||
                  (p.ngayKetThuc && today > p.ngayKetThuc)
                return (
                  <tr key={p.id}>
                    <td className="px-4 fw-bold">{p.ma}</td>
                    <td>{p.loai === 'AMOUNT' ? 'Số tiền' : '%'}</td>
                    <td>{p.loai === 'AMOUNT' ? formatVnd(Number(p.giaTri)) : `${p.giaTri}%`}</td>
                    <td className="small">{(p.ngayBatDau ?? '—') + ' → ' + (p.ngayKetThuc ?? '—')}</td>
                    <td>
                      {expired || !p.active ? (
                        <span className="badge bg-secondary">Hết hạn</span>
                      ) : (
                        <span className="badge bg-success">Active</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Link to={`/admin/promo/edit/${p.id}`} className="btn btn-sm btn-outline-primary me-1">Sửa</Link>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.id)}>Xóa</button>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && <tr><td colSpan={6} className="text-center py-5 text-muted">Chưa có mã.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
