import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword } from '../api/users'
import { ApiError } from '../api/client'
import { UserSidebar } from '../components/UserSidebar'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [err, setErr] = useState('')

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const oldPassword = String(fd.get('oldPassword') ?? '')
    const newPassword = String(fd.get('newPassword') ?? '')
    const confirmPassword = String(fd.get('confirmPassword') ?? '')
    setErr('')

    if (newPassword !== confirmPassword) {
      setErr('Mật khẩu xác nhận không khớp')
      return
    }
    if (newPassword.length < 6) {
      setErr('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      await changePassword(oldPassword, newPassword)
      form.reset()
      navigate('/user/profile', { replace: true, state: { flash: 'Đổi mật khẩu thành công' } })
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Không đổi được mật khẩu')
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
          <h3 className="fw-bold mb-4 text-center">Đổi mật khẩu</h3>
          {err && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle me-2" />
              {err}
            </div>
          )}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={savePassword}>
                <div className="row g-4">
                  <div className="col-md-12">
                    <label className="form-label small text-muted text-uppercase fw-bold">Mật khẩu hiện tại</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">
                        <i className="bi bi-shield-lock" />
                      </span>
                      <input
                        name="oldPassword"
                        type="password"
                        className="form-control form-control-lg border-0 bg-light rounded-end-3"
                        required
                        placeholder="Nhập mật khẩu cũ..."
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small text-muted text-uppercase fw-bold">Mật khẩu mới</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">
                        <i className="bi bi-key" />
                      </span>
                      <input
                        name="newPassword"
                        type="password"
                        className="form-control form-control-lg border-0 bg-light rounded-end-3"
                        required
                        minLength={6}
                        placeholder="Nhập mật khẩu mới..."
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small text-muted text-uppercase fw-bold">Xác nhận mật khẩu mới</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">
                        <i className="bi bi-key-fill" />
                      </span>
                      <input
                        name="confirmPassword"
                        type="password"
                        className="form-control form-control-lg border-0 bg-light rounded-end-3"
                        required
                        placeholder="Nhập lại mật khẩu mới..."
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-top text-end">
                  <Link to="/user/profile" className="btn btn-outline-secondary rounded-pill px-4 fw-bold me-2">
                    Hủy bỏ
                  </Link>
                  <button type="submit" className="btn btn-warning rounded-pill px-5 fw-bold shadow">
                    <i className="bi bi-shield-check me-1" />
                    Xác nhận đổi mật khẩu
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
