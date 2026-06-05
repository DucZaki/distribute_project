import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAdminUser, updateAdminUser } from '../../api/adminUsers'

export function AdminUserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = Number(id)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tenDangNhap: '',
    hoTen: '',
    email: '',
    password: '',
    number: '',
    vaiTro: 'USER',
  })

  useEffect(() => {
    if (!userId) return
    getAdminUser(userId)
      .then((r) => {
        const u = r.data
        setForm({
          tenDangNhap: u.tenDangNhap ?? '',
          hoTen: u.hoTen ?? '',
          email: u.email ?? '',
          password: '',
          number: u.number ?? '',
          vaiTro: u.vaiTro ?? 'USER',
        })
      })
      .catch(() => setError('Không tải được user'))
  }, [userId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const body: Record<string, string> = {
      tenDangNhap: form.tenDangNhap,
      hoTen: form.hoTen,
      email: form.email,
      number: form.number,
      vaiTro: form.vaiTro,
    }
    if (form.password.trim()) body.password = form.password
    try {
      await updateAdminUser(userId, body)
      navigate(`/admin/user/${userId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-warning text-white py-3">
          <h4 className="mb-0">Chỉnh sửa người dùng</h4>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit} autoComplete="off">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  className="form-control"
                  required
                  value={form.tenDangNhap}
                  onChange={(e) => setForm({ ...form, tenDangNhap: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-control"
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
                  placeholder="Để trống nếu không đổi mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Số điện thoại</label>
                <input
                  className="form-control"
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
              <Link to={`/admin/user/${userId}`} className="btn btn-secondary me-2">Huỷ</Link>
              <button type="submit" className="btn btn-warning text-white">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
