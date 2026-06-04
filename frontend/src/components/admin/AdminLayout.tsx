import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function toggleTheme() {
  const html = document.documentElement
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', next)
  localStorage.setItem('zakibooking-theme', next)
}

export function AdminLayout() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [tourMenuOpen, setTourMenuOpen] = useState(
    () => window.location.pathname.includes('/admin/tour'),
  )

  useEffect(() => {
    if (window.location.pathname.includes('/admin/tour')) setTourMenuOpen(true)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4 className="fw-bold mb-1">403</h4>
          <div>Bạn không có quyền truy cập trang quản trị.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header w-100 border-bottom bg-white">
        <div className="d-flex justify-content-between align-items-center px-4">
          <div className="d-flex align-items-center gap-2">
            <Link to="/">
              <img src="/favicon.icon" alt="Logo" height={80} className="rounded" />
            </Link>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-dark btn-sm shadow-sm">
              <i className="bi bi-window me-1" />
              Client
            </Link>
            <button
              type="button"
              id="darkModeToggle"
              title="Chuyển chế độ tối/sáng"
              className="ms-2"
              onClick={toggleTheme}
            >
              🌙
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="d-flex">
        <nav className="admin-sidebar border-end bg-white">
          <ul className="nav flex-column px-3 py-2">
            <li className="nav-item mb-1">
              <NavLink end className="nav-link" to="/admin">
                <i className="bi bi-speedometer2 me-2" />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink className="nav-link" to="/admin/user">
                <i className="bi bi-people me-2" />
                Quản lý người dùng
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <button
                type="button"
                className="nav-link w-100 border-0 bg-transparent d-flex justify-content-between align-items-center"
                onClick={() => setTourMenuOpen((o) => !o)}
              >
                <span>
                  <i className="bi bi-airplane me-2" />
                  Quản lý chuyến đi
                </span>
                <i className={`bi bi-chevron-${tourMenuOpen ? 'up' : 'down'} small`} />
              </button>
              {tourMenuOpen && (
                <ul className="nav flex-column ps-3">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/tour/active">
                      <i className="bi bi-play-circle me-2 text-success" />
                      Tour đang hoạt động
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/tour/completed">
                      <i className="bi bi-check-circle me-2 text-secondary" />
                      Tour đã kết thúc
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li className="nav-item mb-1">
              <NavLink className="nav-link" to="/admin/promo">
                <i className="bi bi-ticket-perforated me-2" />
                Mã giảm giá
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink className="nav-link" to="/admin/contact">
                <i className="bi bi-envelope me-2" />
                Quản lý liên hệ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/danh-gia">
                <i className="bi bi-star me-2" />
                Quản lý đánh giá
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="flex-grow-1 p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Outlet />
        </main>
      </div>

      <footer className="admin-footer mt-auto">
        <div className="container-fluid py-3 border-top">
          <div className="d-flex justify-content-center align-items-center small text-muted">
            © 2026 ZakiBooking Admin
          </div>
        </div>
      </footer>
    </div>
  )
}
