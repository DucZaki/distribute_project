import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminUser, updateAdminUser } from '../../api/adminUsers'

export function AdminUserDetailPage() {
  const { id } = useParams()
  const userId = Number(id)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ hoTen: '', number: '', vaiTro: 'USER', enabled: true })

  useEffect(() => {
    if (!userId) return
    getAdminUser(userId).then((r) => {
      const u = r.data
      setForm({
        hoTen: u.hoTen ?? '',
        number: u.number ?? '',
        vaiTro: u.vaiTro ?? 'USER',
        enabled: u.enabled !== false,
      })
    }).catch(() => setMsg('Không tải được user'))
  }, [userId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await updateAdminUser(userId, form)
      setMsg('Đã cập nhật')
    } catch (err: any) {
      setMsg(err.message ?? 'Lỗi')
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">Chi tiết người dùng #{id}</h2>
        <Link to="/admin/user" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Họ tên</label>
          <input className="form-control" value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input className="form-control" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Vai trò</label>
          <select className="form-select" value={form.vaiTro} onChange={(e) => setForm({ ...form, vaiTro: e.target.value })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <label className="form-check-label">Enabled</label>
        </div>
        <button type="submit" className="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  )
}
