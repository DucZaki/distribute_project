import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserSpending } from '../../api/adminDashboard'
import { deleteAdminUser, listAdminUsers, type AdminUser } from '../../api/adminUsers'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd } from '../../utils/format'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [spendingMap, setSpendingMap] = useState<Record<number, { purchases: number; spending: number }>>({})

  function load(p = 0) {
    listAdminUsers(p, 20).then((r) => {
      setUsers(r.data.content ?? [])
      setTotalPages(r.data.totalPages ?? 0)
      setPage(r.data.page ?? p)
    }).catch(() => setUsers([]))
  }

  useEffect(() => {
    load(0)
    getUserSpending().then((r) => {
      const m: Record<number, { purchases: number; spending: number }> = {}
      ;(r.data ?? []).forEach((x) => {
        m[x.userId] = { purchases: x.purchases, spending: Number(x.spending) }
      })
      setSpendingMap(m)
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        String(u.id).includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.tenDangNhap?.toLowerCase().includes(q) ||
        u.hoTen?.toLowerCase().includes(q),
    )
  }, [users, keyword])

  async function onDelete(id: number) {
    if (!confirm('Xóa người dùng này?')) return
    await deleteAdminUser(id)
    load(page)
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold mb-0">Quản lý người dùng</h2>
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ minWidth: 280 }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search" /></span>
            <input className="form-control border-start-0" placeholder="Tìm theo tên, email, username, ID..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <Link to="/admin/user/create" className="btn btn-dark btn-sm"><i className="bi bi-plus-circle me-1" />Tạo mới</Link>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Người dùng</th>
                <th>Liên hệ</th>
                <th className="text-center">Vai trò</th>
                <th className="text-center">Booking</th>
                <th className="text-end">Chi tiêu</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const stat = spendingMap[u.id]
                return (
                  <tr key={u.id}>
                    <td className="px-4">
                      <div className="fw-bold">{u.hoTen || u.tenDangNhap}</div>
                      <div className="text-muted small">ID: #{u.id}</div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{u.email}</div>
                      <div className="text-muted small">{u.number || '-'}</div>
                    </td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-3 ${u.vaiTro === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>{u.vaiTro}</span>
                    </td>
                    <td className="text-center fw-bold">{stat?.purchases ?? 0}</td>
                    <td className="text-end fw-bold text-success">{formatVnd(stat?.spending ?? 0)}</td>
                    <td className="text-center">
                      <Link to={`/admin/user/${u.id}`} className="btn btn-sm btn-outline-primary me-1">Chi tiết</Link>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u.id)}>Xóa</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-5 text-muted">Không có người dùng.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
