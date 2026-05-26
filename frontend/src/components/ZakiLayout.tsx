import { type FormEvent, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Chatbot } from './Chatbot'

export function ZakiLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  function navSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    ;['diemDen', 'ngayDi', 'khoangGia'].forEach((k) => {
      const v = String(fd.get(k) ?? '')
      if (v) params.set(k, v)
    })
    setSearchOpen(false)
    navigate(`/tour?${params}`)
  }

  return (
    <>
      <nav className="premium-nav-dock d-flex align-items-center justify-content-between">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/favicon.icon" alt="Logo" height={50} className="rounded-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="ms-2 fw-bold d-none d-sm-inline">ZakiBooking</span>
        </Link>

        <div className="d-none d-lg-flex align-items-center gap-2">
          <div className="nav-item dropdown position-static">
            <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              Destinations
            </a>
            <div className="dropdown-menu border-0 shadow-lg mt-3 mega-menu p-4" style={{ borderRadius: 24, minWidth: 600 }}>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--bs-primary)' }}>
                    TRONG NƯỚC
                  </h6>
                  {['Sapa', 'Hạ Long', 'Đà Nẵng', 'Huế'].map((c) => (
                    <Link key={c} to={`/tour?thanhPho=${encodeURIComponent(c)}`} className="dropdown-item rounded-3">
                      {c}
                    </Link>
                  ))}
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--bs-primary)' }}>
                    NƯỚC NGOÀI
                  </h6>
                  {['Thái Lan', 'Hàn Quốc', 'Pháp'].map((c) => (
                    <Link key={c} to={`/tour?quocGia=${encodeURIComponent(c)}`} className="dropdown-item rounded-3">
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <NavLink className="nav-link" to="/tour">
            Tours
          </NavLink>
          <NavLink className="nav-link" to="/tin-tuc">
            News
          </NavLink>
          <NavLink className="nav-link" to="/contact">
            Contact Us
          </NavLink>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn p-0 border-0 nav-search-toggle"
            aria-label="Tìm kiếm tour"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <i className="bi bi-search fs-5" />
          </button>
          {isAdmin && (
            <Link to="/admin" className="btn btn-dark rounded-pill px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              <i className="bi bi-shield-lock-fill" /> Admin
            </Link>
          )}
          {isAuthenticated ? (
            <div className="dropdown">
              <div className="user-profile-icon" data-bs-toggle="dropdown" role="button">
                {user?.anhDaiDien ? (
                  <img src={user.anhDaiDien} className="w-100 h-100 rounded-circle object-cover" alt="" />
                ) : (
                  <i className="bi bi-person" />
                )}
              </div>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-3" style={{ borderRadius: 16 }}>
                {isAdmin && (
                  <>
                    <li>
                      <Link className="dropdown-item fw-bold" to="/admin" style={{ color: 'var(--bs-primary)' }}>
                        <i className="bi bi-shield-lock-fill me-2" />
                        Admin Panel
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
                <li><Link className="dropdown-item" to="/user/profile">Hồ sơ cá nhân</Link></li>
                <li><Link className="dropdown-item" to="/user/bookings">Đơn đặt chỗ</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button type="button" className="dropdown-item text-danger fw-bold" onClick={logout}>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-dark rounded-pill px-4">
              Sign in
            </Link>
          )}
          <button type="button" className="btn p-0 border-0 ms-1" id="darkModeToggle" style={{ background: 'none', fontSize: '1.2rem' }}>
            🌙
          </button>
        </div>
      </nav>

      <div className={`nav-search-dropdown${searchOpen ? ' show' : ''}`} id="navSearchPanel" aria-hidden={!searchOpen}>
        <div className="nav-search-dropdown-inner">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-bold search-dropdown-title">Tìm tour</span>
            <button type="button" className="btn-close nav-search-close" aria-label="Đóng" onClick={() => setSearchOpen(false)} />
          </div>
          <form className="search-card search-card--nav" onSubmit={navSearch} autoComplete="off">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="search-field-label"><i className="bi bi-geo-alt-fill" /> Bạn muốn đi đâu?</label>
                <input className="form-control search-field-input" name="diemDen" placeholder="ví dụ: Đà Nẵng..." />
              </div>
              <div className="col-md-3">
                <label className="search-field-label"><i className="bi bi-calendar-event-fill" /> Ngày đi</label>
                <input className="form-control search-field-input zaki-date" name="ngayDi" placeholder="dd/mm/yyyy" />
              </div>
              <div className="col-md-3">
                <label className="search-field-label"><i className="bi bi-tag-fill" /> Khoảng giá</label>
                <select className="form-select search-field-input search-field-select" name="khoangGia" defaultValue="">
                  <option value="">Tất cả mức giá</option>
                  <option value="DUOI5">Dưới 5 triệu</option>
                  <option value="5_10">5 - 10 triệu</option>
                  <option value="TREN10">Trên 10 triệu</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold">
                  TÌM KIẾM
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {searchOpen && <div className="nav-search-scrim show" onClick={() => setSearchOpen(false)} aria-hidden />}

      <main className="pt-5 mt-4">
        <Outlet />
      </main>

      <section className="newsletter">
        <div className="container">
          <h3>Đăng ký nhận tin khuyến mãi</h3>
          <p>Nhận ngay ưu đãi du lịch mới nhất mỗi tuần từ ZakiBooking</p>
          <form
            className="d-flex justify-content-center mt-3 mx-auto"
            style={{ maxWidth: 600 }}
            onSubmit={(e) => {
              e.preventDefault()
              const email = new FormData(e.currentTarget).get('email')
              navigate(`/register?email=${encodeURIComponent(String(email ?? ''))}`)
            }}
          >
            <input type="email" name="email" className="form-control" placeholder="Nhập email của bạn..." required />
            <button type="submit" className="btn btn-primary ms-2">
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-1">&copy; 2025 ZakiBooking</p>
          <p>Email: minhd4360@gmail.com | Hotline: +84 866147595</p>
        </div>
      </footer>

      <Chatbot />
    </>
  )
}
