import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMe } from '../api/users'
import { UserSidebar } from '../components/UserSidebar'
import { useMemberStats } from '../hooks/useMemberStats'
import { useProfileFlash } from '../hooks/useProfileFlash'
import { formatVnd } from '../utils/format'

type UserProfile = {
  hoTen?: string
  email?: string
  number?: string
  tenDangNhap?: string
  vaiTro?: string
  anhDaiDien?: string
}

export function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const { totalSpending, tier } = useMemberStats()
  const flash = useProfileFlash()

  useEffect(() => {
    getMe()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
  }, [])

  return (
    <div className="container user-page-shell">
      <div className="mb-3">
        <Link to="/" className="text-decoration-none text-dark small fw-bold">
          <i className="bi bi-arrow-left me-1" />
          Quay lại trang chủ
        </Link>
      </div>
      <div className="row">
        <UserSidebar active="profile" />
        <div className="col-lg-9">
          <h3 className="fw-bold mb-4 text-center">Thông tin cá nhân</h3>
          {flash && <div className="alert alert-success">{flash}</div>}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Họ và tên</label>
                  <h5 className="fw-bold border-bottom pb-2">{user?.hoTen ?? 'Chưa cập nhật'}</h5>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Email liên hệ</label>
                  <h5 className="fw-bold border-bottom pb-2">{user?.email ?? '—'}</h5>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Số điện thoại</label>
                  <h5 className="fw-bold border-bottom pb-2">{user?.number ?? 'Chưa cập nhật'}</h5>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Tên đăng nhập</label>
                  <h5 className="fw-bold border-bottom pb-2 text-primary">{user?.tenDangNhap ?? '—'}</h5>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Vai trò hệ thống</label>
                  <div>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold">
                      {user?.vaiTro ?? 'USER'}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1 d-block font-monospace text-uppercase">Hạng thành viên</label>
                  <div className="d-flex align-items-center">
                    <span className={`tier-badge ${tier.color}`}>
                      {tier.icon} {tier.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-top">
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
                  <div>
                    <p className="small text-muted mb-0">Tổng tích lũy chi tiêu:</p>
                    <h4 className="text-danger fw-bold mb-0">{formatVnd(totalSpending)}</h4>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to="/user/change-password" className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm">
                      <i className="bi bi-key me-1" />
                      Đổi mật khẩu
                    </Link>
                    <Link to="/user/edit-profile" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                      <i className="bi bi-pencil me-1" />
                      Chỉnh sửa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
