import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminUser } from '../../api/adminUsers'

export function AdminUserFormPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tenDangNhap: '',
    hoTen: '',
    email: '',
    password: '',
    number: '',
    vaiTro: 'USER',
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await createAdminUser({ ...form, enabled: true })
      navigate('/admin/user')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tạo user')
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0">Thêm người dùng mới</h4>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit} autoComplete="off">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  className="form-control"
                  placeholder="Nhập tên đăng nhập..."
                  required
                  value={form.tenDangNhap}
                  onChange={(e) => setForm({ ...form, tenDangNhap: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-control"
                  placeholder="Nhập họ tên người dùng..."
                  required
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập email..."
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập password..."
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input
                  className="form-control"
                  placeholder="Nhập số điện thoại..."
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Quyền</label>
                <select
                  className="form-select"
                  required
                  value={form.vaiTro}
                  onChange={(e) => setForm({ ...form, vaiTro: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-end">
              <Link to="/admin/user" className="btn btn-secondary me-2">Cancel</Link>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
