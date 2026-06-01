import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminUser } from '../../api/adminUsers'

export function AdminUserFormPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tenDangNhap: '',
    email: '',
    password: '',
    hoTen: '',
    number: '',
    vaiTro: 'USER',
    enabled: true,
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await createAdminUser(form)
      navigate('/admin/user')
    } catch (err: any) {
      setError(err.message ?? 'Lỗi tạo user')
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Tạo người dùng</h2>
        <Link to="/admin/user" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={onSubmit}>
        {(['tenDangNhap', 'email', 'password', 'hoTen', 'number'] as const).map((k) => (
          <div className="mb-3" key={k}>
            <label className="form-label fw-semibold text-capitalize">{k}</label>
            <input
              className="form-control"
              type={k === 'password' ? 'password' : 'text'}
              required={k === 'tenDangNhap' || k === 'email' || k === 'password'}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </div>
        ))}
        <div className="mb-3">
          <label className="form-label fw-semibold">Vai trò</label>
          <select className="form-select" value={form.vaiTro} onChange={(e) => setForm({ ...form, vaiTro: e.target.value })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} id="enabled" />
          <label className="form-check-label" htmlFor="enabled">Kích hoạt tài khoản</label>
        </div>
        <button type="submit" className="btn btn-primary">Lưu</button>
      </form>
    </div>
  )
}
