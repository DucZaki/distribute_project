import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNavDockScroll } from "../hooks/useNavDockScroll";
import { useTheme } from "../theme/ThemeContext";
import { Chatbot } from "./Chatbot";

const DOMESTIC_DESTINATIONS = ["Sapa", "Hạ Long", "Đà Nẵng", "Huế"];
const INTERNATIONAL_DESTINATIONS = ["Thái Lan", "Hàn Quốc", "Pháp"];
const MOBILE_DESTINATIONS = [...DOMESTIC_DESTINATIONS, "Thái Lan", "Hàn Quốc"];

function ZakiLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toggleTheme, themeIcon, themeTitle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  useNavDockScroll();

  function navSearch(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    ["diemDen", "ngayDi", "khoangGia"].forEach((k) => {
      const v = String(fd.get(k) ?? "");
      if (v) params.set(k, v);
    });
    setSearchOpen(false);
    navigate(`/tour?${params}`);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <nav className="premium-nav-dock d-flex align-items-center justify-content-between">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/favicon.icon"
            alt="ZakiBooking"
            className="nav-brand-logo rounded-3"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </Link>

        <div className="d-none d-lg-flex align-items-center gap-2">
          <div className="nav-item dropdown position-static">
            <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              Điểm đến
            </a>
            <div className="dropdown-menu border-0 shadow-lg mt-3 mega-menu p-4" style={{ borderRadius: 24, minWidth: 600 }}>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: "var(--bs-primary)" }}>TRONG NƯỚC</h6>
                  {DOMESTIC_DESTINATIONS.map((c) => (
                    <Link key={c} to={`/tour?thanhPho=${encodeURIComponent(c)}`} className="dropdown-item rounded-3">
                      {c}
                    </Link>
                  ))}
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3" style={{ color: "var(--bs-primary)" }}>NƯỚC NGOÀI</h6>
                  {INTERNATIONAL_DESTINATIONS.map((c) => (
                    <Link key={c} to={`/tour?quocGia=${encodeURIComponent(c)}`} className="dropdown-item rounded-3">
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <NavLink className="nav-link" to="/tour">Tour</NavLink>
          <NavLink className="nav-link" to="/tin-tuc">Tin tức</NavLink>
          <NavLink className="nav-link" to="/contact">Liên hệ</NavLink>
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
            <Link to="/admin" className="btn btn-dark rounded-pill px-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              <i className="bi bi-shield-lock-fill" /> Quản trị
            </Link>
          )}
          {isAuthenticated ? (
            <div className="dropdown">
              <div className="user-profile-icon" data-bs-toggle="dropdown" role="button">
                {user?.anhDaiDien ? <img src={user.anhDaiDien} className="w-100 h-100 rounded-circle object-cover" alt="" /> : <i className="bi bi-person" />}
              </div>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-3" style={{ borderRadius: 16 }}>
                {isAdmin && (
                  <>
                    <li><Link className="dropdown-item fw-bold" to="/admin" style={{ color: "var(--bs-primary)" }}><i className="bi bi-shield-lock-fill me-2" />Bảng quản trị</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
                <li><Link className="dropdown-item" to="/user/profile">Hồ sơ cá nhân</Link></li>
                <li><Link className="dropdown-item" to="/user/bookings">Đơn đặt chỗ</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button type="button" className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary rounded-pill px-4 fw-bold">Đăng nhập</Link>
          )}
          <button type="button" className="btn p-0 border-0 ms-1" title={themeTitle} aria-label={themeTitle} style={{ background: "none", fontSize: "1.2rem" }} onClick={toggleTheme}>
            {themeIcon}
          </button>
          <button className="btn btn-dark rounded-circle d-lg-none mobile-menu-toggle" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu" aria-label="Mở menu">
            <i className="bi bi-list fs-5" />
          </button>
        </div>
      </nav>

      {/* Search Portal — renders into document.body so it never affects page layout */}
      {createPortal(
        <>
          <div className={`nav-search-scrim ${searchOpen ? "open" : ""}`} onClick={() => setSearchOpen(false)} />
          <div className={`nav-search-dropdown ${searchOpen ? "open" : ""}`}>
            <div className="nav-search-dropdown-inner">
              <form className="row g-2 search-card--nav" onSubmit={(e) => { navSearch(e); setSearchOpen(false); }}>
                <div className="col-md-5">
                  <input className="form-control" name="diemDen" placeholder="Bạn muốn đi đâu?" autoFocus={searchOpen} />
                </div>
                <div className="col-md-3">
                  <input className="form-control zaki-date" name="ngayDi" placeholder="Ngày đi (dd/mm/yyyy)" />
                </div>
                <div className="col-md-3">
                  <select className="form-select search-field-select" name="khoangGia" defaultValue="">
                    <option value="">Tất cả mức giá</option>
                    <option value="DUOI5">Dưới 5 triệu</option>
                    <option value="5_10">5 - 10 triệu</option>
                    <option value="TREN10">Trên 10 triệu</option>
                  </select>
                </div>
                <div className="col-md-1 d-grid">
                  <button className="btn btn-primary" type="submit">Tìm</button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      <div className="offcanvas offcanvas-end mobile-menu-panel" tabIndex={-1} id="mobileMenu" aria-labelledby="mobileMenuLabel">
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <img
              src="/favicon.icon"
              alt="ZakiBooking"
              height={38}
              className="rounded-3"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <h5 className="offcanvas-title fw-bold mb-0" id="mobileMenuLabel">ZakiBooking</h5>
              <small className="text-muted">Đặt tour nhanh hơn trên điện thoại</small>
            </div>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Đóng" />
        </div>
        <div className="offcanvas-body">
          <div className="mobile-menu-section">
            <Link to="/tour" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-compass" /><span>Tất cả tour</span></Link>
            <Link to="/tin-tuc" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-newspaper" /><span>Tin tức</span></Link>
            <Link to="/contact" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-headset" /><span>Liên hệ hỗ trợ</span></Link>
          </div>
          <div className="mobile-menu-section">
            <div className="mobile-menu-title">Điểm đến phổ biến</div>
            <div className="mobile-destination-grid">
              {MOBILE_DESTINATIONS.map((c) => (
                <Link key={c} to={`/tour?thanhPho=${encodeURIComponent(c)}`} data-bs-dismiss="offcanvas">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      {isHome && (
        <section className="py-5 home-section-newsletter">
          <div className="container text-center py-2">
            <span className="text-primary fw-bold text-uppercase ls-wide mb-2 d-inline-block">Bản tin</span>
            <h2 className="fw-800 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              Nhận ưu đãi tour mới nhất
            </h2>
            <p className="text-muted mb-4">Đăng ký email để không bỏ lỡ các chương trình khuyến mãi cực hot từ ZakiBooking.</p>
            <form className="d-flex justify-content-center mt-3 mx-auto" style={{ maxWidth: 600 }} onSubmit={(e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email");
              navigate(`/register?email=${encodeURIComponent(String(email ?? ""))}`);
            }}>
              <input type="email" name="email" className="form-control" placeholder="Nhập email của bạn..." required />
              <button type="submit" className="btn btn-primary ms-2">Đăng ký</button>
            </form>
          </div>
        </section>
      )}

      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-1">© 2025 ZakiBooking</p>
          <p>Email: minhd4360@gmail.com | Hotline: +84 866147595</p>
        </div>
      </footer>
      <Chatbot />
    </>
  );
}

export { ZakiLayout };
