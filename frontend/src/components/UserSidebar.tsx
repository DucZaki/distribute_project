import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type Props = { active: 'profile' | 'bookings' | 'favorites' }

export function UserSidebar({ active }: Props) {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const item = (key: Props['active'], to: string, label: string, icon: string) => (
    <Link
      to={to}
      className={`list-group-item list-group-item-action border-0 mb-1${
        active === key || loc.pathname === to ? ' fw-bold booking-sidebar-active rounded' : ''
      }`}
    >
      <i className={`bi ${icon} me-2`} />
      {label}
    </Link>
  )

  return (
    <div className="col-lg-3 mb-4">
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle booking-avatar-bg d-flex align-items-center justify-content-center fw-bold overflow-hidden"
              style={{ width: 48, height: 48, fontSize: '1.2rem' }}
            >
              {user?.anhDaiDien ? (
                <img src={user.anhDaiDien} className="w-100 h-100 object-cover" alt="" />
              ) : (
                <span>{user?.hoTen?.charAt(0) ?? '?'}</span>
              )}
            </div>
            <div className="ms-3">
              <h6 className="mb-0 fw-bold">{user?.hoTen ?? 'Khách hàng'}</h6>
              <p className="mb-0 text-muted small">{user?.email ?? ''}</p>
            </div>
          </div>
          <div className="list-group list-group-flush small">
            {item('profile', '/user/profile', 'Tài khoản', 'bi-person')}
            {item('bookings', '/user/bookings', 'Đơn đặt chỗ', 'bi-luggage')}
            {item('favorites', '/favorites/my-favorites', 'Các tour yêu thích', 'bi-bookmark-heart')}
            <button type="button" className="list-group-item list-group-item-action text-danger fw-bold border-0" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
