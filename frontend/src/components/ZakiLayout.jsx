import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getAllDestinations } from "../api/tours";
import {
  TOUR_CATEGORIES,
  destinationThumb,
  splitDestinations,
  tourCategoryLink,
} from "../constants/navConfig";
import { useNavDockScroll } from "../hooks/useNavDockScroll";
import { useTheme } from "../theme/ThemeContext";
import { Chatbot } from "./Chatbot";

function DestinationMegaItem({ dest }) {
  const name = dest.ten ?? dest.name ?? "";
  const img = destinationThumb(dest);
  return (
    <Link
      to={`/tour?diemDen=${encodeURIComponent(name)}`}
      className="mega-dest-card"
    >
      <div className="mega-dest-img-wrapper">
        <img src={img} alt={name} className="mega-dest-img" loading="lazy" />
      </div>
      <div className="mega-dest-info">
        <span className="mega-dest-name">{name}</span>
        <span className="mega-dest-sub">Tìm hiểu tour →</span>
      </div>
    </Link>
  );
}

function ZakiLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toggleTheme, themeIcon, themeTitle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [destinations, setDestinations] = useState({ domestic: [], international: [] });
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  useNavDockScroll();

  useEffect(() => {
    getAllDestinations()
      .then((r) => setDestinations(splitDestinations(r.data ?? [])))
      .catch(() => setDestinations({ domestic: [], international: [] }));
  }, []);

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

  const { domestic, international } = destinations;

  return (
    <>
      <nav className="premium-nav-dock">
        <div className="nav-dock-inner d-flex align-items-center w-100">
          <Link className="navbar-brand d-flex align-items-center flex-shrink-0" to="/">
            <img
              src="/favicon.icon"
              alt="ZakiBooking"
              className="nav-brand-logo rounded-3"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>

          <div className="nav-main-links d-none d-lg-flex align-items-center">
            <div className="nav-item dropdown">
              <button type="button" className="nav-link dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                Điểm đến
              </button>
              <div className="dropdown-menu border-0 shadow-lg mega-menu mega-menu-wide">
                {/* ── Header strip ── */}
                <div className="mega-dest-header">
                  <span className="mega-dest-label">Khám phá các điểm đến phổ biến</span>
                  <Link to="/tour" className="mega-dest-viewall">Xem bản đồ du lịch <i className="bi bi-geo-alt-fill" /></Link>
                </div>

                {/* ── Body: columns ── */}
                <div className="mega-dest-body">
                  <div className="mega-dest-col">
                    <h6 className="mega-section-title mb-3">Trong nước</h6>
                    <div className="mega-dest-grid">
                      {(domestic.length ? domestic : [{ ten: "Hà Nội" }, { ten: "Hạ Long" }, { ten: "Đà Nẵng" }, { ten: "Phú Quốc" }]).map((d) => (
                        <DestinationMegaItem key={d.id ?? d.ten} dest={d} />
                      ))}
                    </div>
                  </div>

                  <div className="mega-dest-col">
                    <h6 className="mega-section-title mb-3">Nước ngoài</h6>
                    <div className="mega-dest-grid">
                      {(international.length ? international : [{ ten: "Tokyo" }, { ten: "Seoul" }, { ten: "Bắc Kinh" }]).map((d) => (
                        <DestinationMegaItem key={d.id ?? d.ten} dest={d} />
                      ))}
                    </div>
                  </div>

                  {/* Spotlight card column */}
                  <div className="mega-dest-spotlight">
                    <div className="mega-spotlight-card">
                      <div className="mega-spotlight-badge"><i className="bi bi-star-fill" /> XU HƯỚNG</div>
                      <div className="mega-spotlight-content">
                        <span className="mega-spotlight-subtitle">Điểm đến mùa hè</span>
                        <h5 className="mega-spotlight-title">Vịnh Hạ Long</h5>
                        <p className="mega-spotlight-desc">Trải nghiệm du thuyền 5 sao đẳng cấp giữa kỳ quan thiên nhiên thế giới.</p>
                        <Link to="/tour?diemDen=Hạ%20Long" className="mega-spotlight-btn">
                          Đặt ngay <i className="bi bi-arrow-right-short" />
                        </Link>
                      </div>
                      <div className="mega-spotlight-bg" style={{ backgroundImage: `url('/anh/diemden/halong.jpg')` }} />
                      <div className="mega-spotlight-overlay" />
                    </div>
                  </div>
                </div>

                {/* ── Footer strip ── */}
                <div className="mega-dest-footer">
                  <div className="mega-dest-footer-left">
                    <i className="bi bi-info-circle-fill" />
                    <span>Hơn <strong>100+ tour</strong> nội địa & quốc tế chất lượng cao đã sẵn sàng</span>
                  </div>
                  <Link to="/tour" className="btn mega-dest-footer-btn">Tìm tour phù hợp →</Link>
                </div>
              </div>
            </div>

            <div className="nav-item dropdown">
              <button type="button" className="nav-link dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                Tour
              </button>
              <div className="dropdown-menu border-0 shadow-lg mega-menu mega-menu-tours">
                {/* ── Header strip ── */}
                <div className="mega-tours-header">
                  <span className="mega-tours-label">Khám phá theo loại hình</span>
                  <Link to="/tour" className="mega-tours-viewall">Xem tất cả <i className="bi bi-arrow-right" /></Link>
                </div>

                {/* ── Body: categories + featured panel ── */}
                <div className="mega-tours-body">
                  {/* Category grid */}
                  <div className="mega-tours-cats">
                    {TOUR_CATEGORIES.map((cat, idx) => (
                      <Link
                        key={cat.id}
                        to={tourCategoryLink(cat)}
                        className={`mega-cat-card mega-cat-card--${cat.id}`}
                      >
                        <span className="mega-cat-card__icon">
                          <i className={`bi ${cat.icon}`} />
                        </span>
                        <div className="mega-cat-card__body">
                          <span className="mega-cat-card__title">{cat.label}</span>
                          <span className="mega-cat-card__desc">{cat.desc}</span>
                        </div>
                        <i className="bi bi-chevron-right mega-cat-card__arrow" />
                      </Link>
                    ))}
                  </div>

                  {/* Featured panel */}
                  <div className="mega-tours-featured">
                    <div className="mega-featured-badge"><i className="bi bi-fire" /> HOT DEAL</div>
                    <div className="mega-featured-title">Combo Du lịch<br />Tiết kiệm đến 40%</div>
                    <p className="mega-featured-desc">Đặt sớm — nhận ngay ưu đãi đặc biệt từ ZakiBooking cho các tour hè 2025.</p>
                    <Link to="/uu-dai" className="mega-featured-cta">
                      Xem ưu đãi <i className="bi bi-arrow-right-circle-fill" />
                    </Link>
                    <div className="mega-featured-bg-shapes" aria-hidden="true">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>

                {/* ── Footer strip ── */}
                <div className="mega-tours-footer">
                  <div className="mega-tours-footer-left">
                    <i className="bi bi-telephone-fill" />
                    <span>Tư vấn miễn phí: <strong>+84 866 147 595</strong></span>
                  </div>
                  <Link to="/tour" className="btn mega-tours-footer-btn">Xem tất cả tour →</Link>
                </div>
              </div>
            </div>

            <NavLink className="nav-link nav-link-promo" to="/uu-dai">
              <i className="bi bi-fire me-1" />
              Combo Hot
            </NavLink>
            <NavLink className="nav-link" to="/tin-tuc">Tin tức</NavLink>
            <NavLink className="nav-link" to="/ve-chung-toi">Về chúng tôi</NavLink>
            <NavLink className="nav-link" to="/contact">Liên hệ</NavLink>
          </div>

          <div className="nav-utilities d-flex align-items-center gap-2 ms-auto flex-shrink-0">
            <button
              type="button"
              className="btn p-0 border-0 nav-search-toggle"
              aria-label="Tìm kiếm tour"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <i className="bi bi-search fs-5" />
            </button>

            {isAdmin && (
              <Link to="/admin" className="btn btn-dark rounded-pill px-3 d-flex align-items-center gap-2 nav-admin-btn">
                <i className="bi bi-shield-lock-fill" />
                <span className="d-none d-xl-inline">Quản trị</span>
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
                        <Link className="dropdown-item fw-bold" to="/admin" style={{ color: "var(--bs-primary)" }}>
                          <i className="bi bi-shield-lock-fill me-2" />
                          Bảng quản trị
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  <li><Link className="dropdown-item" to="/user/profile">Hồ sơ cá nhân</Link></li>
                  <li><Link className="dropdown-item" to="/user/bookings">Đơn đặt chỗ</Link></li>
                  <li><Link className="dropdown-item" to="/user/favorite">Tour yêu thích</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button type="button" className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary rounded-pill px-4 fw-bold">Đăng nhập</Link>
            )}

            <button type="button" className="btn p-0 border-0" title={themeTitle} aria-label={themeTitle} style={{ background: "none", fontSize: "1.2rem" }} onClick={toggleTheme}>
              {themeIcon}
            </button>
            <button className="btn btn-dark rounded-circle d-lg-none mobile-menu-toggle" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu" aria-label="Mở menu">
              <i className="bi bi-list fs-5" />
            </button>
          </div>
        </div>
      </nav>

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
            <img src="/favicon.icon" alt="ZakiBooking" height={38} className="rounded-3" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <h5 className="offcanvas-title fw-bold mb-0" id="mobileMenuLabel">ZakiBooking</h5>
              <small className="text-muted">Đặt tour nhanh trên điện thoại</small>
            </div>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Đóng" />
        </div>
        <div className="offcanvas-body">
          <div className="mobile-menu-section">
            <Link to="/uu-dai" className="mobile-menu-link mobile-menu-link-promo" data-bs-dismiss="offcanvas">
              <i className="bi bi-fire" /><span>Combo Hot</span>
            </Link>
            <Link to="/tour" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-compass" /><span>Tất cả tour</span></Link>
            <Link to="/tin-tuc" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-newspaper" /><span>Tin tức</span></Link>
            <Link to="/ve-chung-toi" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-building" /><span>Về chúng tôi</span></Link>
            <Link to="/contact" className="mobile-menu-link" data-bs-dismiss="offcanvas"><i className="bi bi-headset" /><span>Liên hệ</span></Link>
          </div>

          <div className="mobile-menu-section">
            <div className="mobile-menu-title">Trong nước</div>
            <div className="mobile-destination-grid">
              {domestic.map((d) => (
                <Link key={d.id ?? d.ten} to={`/tour?diemDen=${encodeURIComponent(d.ten)}`} data-bs-dismiss="offcanvas">{d.ten}</Link>
              ))}
            </div>
          </div>

          <div className="mobile-menu-section">
            <div className="mobile-menu-title">Nước ngoài</div>
            <div className="mobile-destination-grid">
              {international.map((d) => (
                <Link key={d.id ?? d.ten} to={`/tour?diemDen=${encodeURIComponent(d.ten)}`} data-bs-dismiss="offcanvas">{d.ten}</Link>
              ))}
            </div>
          </div>

          <div className="mobile-menu-section">
            <div className="mobile-menu-title">Loại tour</div>
            <div className="mobile-destination-grid">
              {TOUR_CATEGORIES.map((cat) => (
                <Link key={cat.id} to={tourCategoryLink(cat)} data-bs-dismiss="offcanvas">{cat.label}</Link>
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
            <h2 className="fw-800 mb-2" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              Nhận ưu đãi tour mới nhất
            </h2>
            <p className="text-muted mb-4">Đăng ký email để không bỏ lỡ các chương trình khuyến mãi cực hot từ ZakiBooking.</p>
            <form
              className="d-flex justify-content-center mt-3 mx-auto"
              style={{ maxWidth: 600 }}
              onSubmit={(e) => {
                e.preventDefault();
                const email = new FormData(e.currentTarget).get("email");
                navigate(`/register?email=${encodeURIComponent(String(email ?? ""))}`);
              }}
            >
              <input type="email" name="email" className="form-control" placeholder="Nhập email của bạn..." required />
              <button type="submit" className="btn btn-primary ms-2">Đăng ký</button>
            </form>
          </div>
        </section>
      )}

      <footer className="site-footer py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <h6 className="footer-title">ZakiBooking</h6>
              <p className="footer-text small">Nền tảng đặt tour du lịch thông minh — khám phá trong nước &amp; quốc tế với giá minh bạch.</p>
            </div>
            <div className="col-md-6 col-lg-3">
              <h6 className="footer-title">Khám phá</h6>
              <ul className="footer-links list-unstyled">
                <li><Link to="/tour">Tất cả tour</Link></li>
                <li><Link to="/uu-dai">Khuyến mãi / Combo Hot</Link></li>
                <li><Link to="/tin-tuc">Tin tức</Link></li>
                <li><Link to="/ve-chung-toi">Về chúng tôi</Link></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h6 className="footer-title">Hỗ trợ</h6>
              <ul className="footer-links list-unstyled">
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/user/bookings">Tra cứu đơn đặt</Link></li>
                <li><Link to="/login">Đăng nhập / Đăng ký</Link></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h6 className="footer-title">Liên hệ</h6>
              <ul className="footer-links list-unstyled">
                <li><a href="mailto:minhd4360@gmail.com">minhd4360@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <hr className="footer-divider my-4" />
          <p className="text-center footer-copy mb-0 small">© 2025 ZakiBooking. All rights reserved.</p>
        </div>
      </footer>
      <Chatbot />
    </>
  );
}

export { ZakiLayout };
