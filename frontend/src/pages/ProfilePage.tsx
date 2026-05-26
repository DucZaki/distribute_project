import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, getMe, updateMe } from '../api/users'
import { UserSidebar } from '../components/UserSidebar'
import type { UserProfile } from '../api/users'
import { ApiError } from '../api/client'

export function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    getMe().then((r) => setUser(r.data)).catch(() => {})
  }, [])

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      const res = await updateMe({ hoTen: String(fd.get('hoTen')), number: String(fd.get('number') ?? '') })
      setUser(res.data)
      setMsg('Cập nhật hồ sơ thành công')
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Lỗi cập nhật')
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await changePassword(String(fd.get('oldPassword')), String(fd.get('newPassword')))
      setMsg('Đổi mật khẩu thành công')
      e.currentTarget.reset()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Không đổi được mật khẩu')
    }
  }

  return (
    <div className="container my-5 pt-4">
      <div className="row">
        <UserSidebar active="profile" />
        <div className="col-lg-9">
          <h3 className="fw-bold mb-4">Hồ sơ cá nhân</h3>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold">Thông tin tài khoản</h5>
              <p className="text-muted small">Email: {user?.email} · Vai trò: {user?.vaiTro}</p>
              <form onSubmit={saveProfile} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Họ tên</label>
                  <input name="hoTen" className="form-control" defaultValue={user?.hoTen ?? ''} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại</label>
                  <input name="number" className="form-control" defaultValue={user?.number ?? ''} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold">Đổi mật khẩu</h5>
              <form onSubmit={savePassword} className="row g-3">
                <div className="col-md-4">
                  <input name="oldPassword" type="password" className="form-control" placeholder="Mật khẩu cũ" required />
                </div>
                <div className="col-md-4">
                  <input name="newPassword" type="password" className="form-control" placeholder="Mật khẩu mới" minLength={6} required />
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-outline-primary w-100">Đổi mật khẩu</button>
                </div>
              </form>
            </div>
          </div>
          <p className="mt-3 small"><Link to="/user/bookings">Xem đơn đặt chỗ →</Link></p>
        </div>
      </div>
    </div>
  )
}
