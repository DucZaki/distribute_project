import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useMemberStats } from '../hooks/useMemberStats'
import { formatVnd } from '../utils/format'

type UserSidebarProps = {
  active: 'profile' | 'bookings' | 'favorites'
  showTierProgress?: boolean
}

export function UserSidebar({ active, showTierProgress = true }: UserSidebarProps) {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const { totalSpending, tier } = useMemberStats()

  const item = (key: UserSidebarProps['active'], to: string, label: string, icon: string) => {
    const isActive = active === key || loc.pathname === to
    return (
      <Link
        to={to}
        className={`list-group-item list-group-item-action border-0 mb-1${
          isActive ? ' fw-bold booking-sidebar-active rounded' : ''
        }`}
      >
        <i className={`bi ${icon} me-2`} />
        {label}
      </Link>
    )
  }

  const initial = user?.hoTen?.charAt(0) ?? '?'

  return (
    <div className="col-lg-3 mb-4">
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle booking-avatar-bg d-flex align-items-center justify-content-center fw-bold overflow-hidden shadow-sm"
              style={{ width: 64, height: 64, fontSize: '1.5rem', border: '2px solid #fff' }}
            >
              {user?.anhDaiDien ? (
                <img src={user.anhDaiDien} className="w-100 h-100 object-cover" alt="" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="ms-3">
              <h6 className="mb-0 fw-bold">{user?.hoTen ?? 'Khách hàng'}</h6>
              <p className="mb-0 text-muted small">{user?.email ?? 'Chưa cập nhật email'}</p>
            </div>
          </div>

          <div className="mb-3 text-center">
            <span className={`tier-badge ${tier.color}`}>
              {tier.icon} {tier.name}
            </span>
            {showTierProgress && tier.name !== 'Kim Cương' && (
              <div className="mt-2">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>{formatVnd(totalSpending)}</span>
                  <span>{tier.targetLabel}</span>
                </div>
                <div className="tier-progress-wrap">
                  <div
                    className={`tier-progress-bar ${tier.color.replace('tier-', '')}`}
                    style={{ width: `${tier.progress}%` }}
                  />
                </div>
                {tier.nextTier && (
                  <p className="small text-muted mt-1 mb-0">
                    Đến hạng <strong>{tier.nextTier}</strong>
                  </p>
                )}
              </div>
            )}
            {showTierProgress && tier.name === 'Kim Cương' && (
              <p className="small text-muted mt-1 mb-0">✨ Đã đạt hạng cao nhất!</p>
            )}
            {!showTierProgress && (
              <p className="small text-muted mt-1 mb-0">{formatVnd(totalSpending)} tích lũy</p>
            )}
          </div>

          <div className="list-group list-group-flush small">
            {item('profile', '/user/profile', 'Tài khoản', 'bi-person')}
            {item('bookings', '/user/bookings', 'Đơn đặt chỗ', 'bi-luggage')}
            {item('favorites', '/favorites/my-favorites', 'Các tour yêu thích', 'bi-bookmark-heart')}
            <button
              type="button"
              className="list-group-item list-group-item-action text-danger fw-bold border-0"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
