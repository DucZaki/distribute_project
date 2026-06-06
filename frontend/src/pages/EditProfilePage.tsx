import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe, updateMe } from '../api/users'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { UserSidebar } from '../components/UserSidebar'

type UserProfile = {
  hoTen?: string
  email?: string
  number?: string
  tenDangNhap?: string
}

export function EditProfilePage() {
  const navigate = useNavigate()
  const { user: authUser, loginSession } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    getMe()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
  }, [])

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErr('')
    try {
      const res = await updateMe({
        hoTen: String(fd.get('hoTen') ?? ''),
        number: String(fd.get('number') ?? ''),
      })
      const updated = res.data as UserProfile
      setUser(updated)
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      if (authUser && accessToken && refreshToken) {
        loginSession(accessToken, refreshToken, { ...authUser, ...updated })
      }
      navigate('/user/profile', { replace: true, state: { flash: 'Cập nhật hồ sơ thành công' } })
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Lỗi cập nhật')
    }
  }

  return (
    <div className="container user-page-shell">
      <div className="mb-3">
        <Link to="/user/profile" className="text-decoration-none text-dark small fw-bold">
          <i className="bi bi-arrow-left me-1" />
          Quay lại hồ sơ
        </Link>
      </div>
      <div className="row">
        <UserSidebar active="profile" />
        <div className="col-lg-9">
          <h3 className="fw-bold mb-4 text-center">Chỉnh sửa thông tin</h3>
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={saveProfile}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label small text-muted text-uppercase fw-bold">Họ và tên</label>
                    <input
                      name="hoTen"
                      className="form-control form-control-lg border-0 bg-light rounded-3"
                      placeholder="Nhập họ tên..."
                      defaultValue={user?.hoTen ?? ''}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted text-uppercase fw-bold">Email (Không thể sửa)</label>
                    <input
                      type="email"
                      className="form-control form-control-lg border-0 bg-light rounded-3"
                      value={user?.email ?? ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Tên đăng nhập (Không thể sửa)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-0 bg-light rounded-3"
                      value={user?.tenDangNhap ?? ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small text-muted text-uppercase fw-bold">Số điện thoại</label>
                    <input
                      name="number"
                      className="form-control form-control-lg border-0 bg-light rounded-3"
                      placeholder="Nhập số điện thoại..."
                      defaultValue={user?.number ?? ''}
                    />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-top text-end">
                  <Link to="/user/profile" className="btn btn-outline-secondary rounded-pill px-4 fw-bold me-2">
                    Hủy bỏ
                  </Link>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow">
                    <i className="bi bi-check-lg me-1" />
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
