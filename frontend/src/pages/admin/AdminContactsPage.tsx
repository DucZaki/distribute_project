import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteContact, listContacts, updateContactStatus, type Contact } from '../../api/adminContacts'
import { AdminPagination } from '../../components/admin/AdminPagination'

export function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState('')

  function load(p = 0) {
    listContacts(status || undefined, p, 20).then((r) => {
      setItems(r.data.content ?? [])
      setTotalPages(r.data.totalPages ?? 0)
      setPage(r.data.page ?? p)
    }).catch(() => setItems([]))
  }

  useEffect(() => { load(0) }, [status])

  async function markRead(id: number) {
    await updateContactStatus(id, 'READ')
    load(page)
  }

  async function onDelete(id: number) {
    if (!confirm('Xóa liên hệ?')) return
    await deleteContact(id)
    load(page)
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Quản lý liên hệ</h2>
        <select className="form-select form-select-sm" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="NEW">Mới</option>
          <option value="READ">Đã đọc</option>
        </select>
      </div>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Người gửi</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-4">
                    <div className="fw-bold">{c.hoTen}</div>
                    <div className="small text-muted">{c.email}</div>
                  </td>
                  <td>{c.tieuDe || c.noiDung?.slice(0, 40)}</td>
                  <td><span className="badge bg-secondary">{c.trangThai}</span></td>
                  <td className="small text-muted">{c.createdAt ? String(c.createdAt).slice(0, 16) : '-'}</td>
                  <td className="text-center">
                    <Link to={`/admin/contact/${c.id}`} className="btn btn-sm btn-outline-primary me-1">Xem</Link>
                    {c.trangThai === 'NEW' && (
                      <button type="button" className="btn btn-sm btn-outline-success me-1" onClick={() => markRead(c.id)}>Đã đọc</button>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted">Không có liên hệ.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
