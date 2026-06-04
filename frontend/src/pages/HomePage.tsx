import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFeaturedDestinations, getFeaturedTours, searchTours } from '../api/tours'
import { CustomerReviewsSection } from '../components/CustomerReviewsSection'
import { NearbyToursSection } from '../components/NearbyToursSection'
import type { DiemDenSummary, TourSummary } from '../types/api'
import { TourCardStats } from '../components/TourCardStats'
import { formatVnd, imageUrl } from '../utils/format'

export function HomePage() {
  const navigate = useNavigate()
  const [tours, setTours] = useState<TourSummary[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState<string | null>(null)
  const [destinations, setDestinations] = useState<DiemDenSummary[]>([])
  const FEATURED_LIMIT = 3
  const REFRESH_MS = 30_000

  useEffect(() => {
    let cancelled = false

    const applyTours = (top: TourSummary[]) => {
      setTours(top)
      setFeaturedError(null)
    }

    const loadFeatured = (showSpinner = false) => {
      if (showSpinner && !cancelled) setFeaturedLoading(true)
      getFeaturedTours(FEATURED_LIMIT)
        .then((r) => {
          if (cancelled) return
          const top = (r.data ?? []).slice(0, FEATURED_LIMIT)
          if (top.length > 0) {
            applyTours(top)
            return
          }
          return searchTours({ sort: 'popular', size: FEATURED_LIMIT, page: 0 }).then((page) => {
            if (cancelled) return
            applyTours((page.data?.content ?? []).slice(0, FEATURED_LIMIT))
          })
        })
        .catch(() =>
          searchTours({ sort: 'popular', size: FEATURED_LIMIT, page: 0 })
            .then((page) => {
              if (cancelled) return
              const top = (page.data?.content ?? []).slice(0, FEATURED_LIMIT)
              if (top.length > 0) {
                applyTours(top)
              } else if (!cancelled) {
                setTours([])
                setFeaturedError('Không tải được tour nổi bật. Thử tải lại trang sau vài giây.')
              }
            })
            .catch(() => {
              if (!cancelled) {
                setTours([])
                setFeaturedError('Không tải được tour nổi bật. Kiểm tra api-gateway và tour-service.')
              }
            })
        )
        .finally(() => {
          if (!cancelled) setFeaturedLoading(false)
        })
    }

    loadFeatured(true)
    const timer = window.setInterval(() => loadFeatured(false), REFRESH_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadFeatured(false)
    }
    document.addEventListener('visibilitychange', onVisible)

    getFeaturedDestinations().then((r) => {
      if (!cancelled) setDestinations(r.data ?? [])
    })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <section>
      <header className="hero-section text-center">
        <div className="container">
          <h1 id="typing-text">
            Bạn muốn đi đâu cùng <span className="brand-gradient">ZakiBooking?</span>
          </h1>
          <p className="lead hero-lead mx-auto">
            Khám phá hàng ngàn tour du lịch hấp dẫn với giá tốt nhất, kiến tạo những kỷ niệm vô giá cùng chúng tôi.
          </p>
        </div>
      </header>

      <section className="search-section py-4" id="homeSearch" style={{ marginTop: -60, position: 'relative', zIndex: 10 }}>
        <div className="container">
          <form
            className="search-card p-4 rounded-5 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const params = new URLSearchParams()
              ;['diemDen', 'ngayDi', 'khoangGia'].forEach((k) => {
                const v = String(fd.get(k) ?? '')
                if (v) params.set(k, v)
              })
              navigate(`/tour?${params}`)
            }}
            autoComplete="off"
          >
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label className="search-field-label"><i className="bi bi-geo-alt-fill" /> Bạn muốn đi đâu?</label>
                <input className="form-control search-field-input" name="diemDen" placeholder="ví dụ: Đà Nẵng, Phú Quốc..." />
              </div>
              <div className="col-lg-3">
                <label className="search-field-label"><i className="bi bi-calendar-event-fill" /> Ngày đi</label>
                <input className="form-control search-field-input zaki-date" name="ngayDi" placeholder="dd/mm/yyyy" />
              </div>
              <div className="col-lg-3">
                <label className="search-field-label"><i className="bi bi-tag-fill" /> Khoảng giá</label>
                <select className="form-select search-field-input search-field-select" name="khoangGia" defaultValue="">
                  <option value="">Tất cả mức giá</option>
                  <option value="DUOI5">Dưới 5 triệu</option>
                  <option value="5_10">5 - 10 triệu</option>
                  <option value="TREN10">Trên 10 triệu</option>
                </select>
              </div>
              <div className="col-lg-2">
                <button type="submit" className="btn btn-primary w-100 py-3 shadow-sm fw-bold">
                  TÌM KIẾM
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <NearbyToursSection />

      <section className="py-5">
        <div className="container">
          <div className="d-flex align-items-end justify-content-between mb-5">
            <div>
              <h6 className="text-primary fw-bold text-uppercase ls-wide">Explore</h6>
              <h2 className="fw-800 mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
                Điểm đến nổi bật
              </h2>
            </div>
            <Link to="/tour" className="text-dark fw-bold text-decoration-none border-bottom border-2 border-primary pb-1">
              Xem tất cả
            </Link>
          </div>
          <div className="row g-4">
            {destinations.map((dd) => (
              <div key={dd.id} className="col-md-4">
                <Link to={`/tour?diemDen=${encodeURIComponent(dd.ten)}`} className="text-decoration-none">
                  <div className="card h-100 group border-0 shadow-sm">
                    <div className="img-zoom" style={{ height: 300 }}>
                      <img src={imageUrl(dd.hinhAnh)} className="w-100 h-100 object-cover" alt={dd.ten} />
                      <div
                        className="card-img-overlay d-flex flex-column justify-content-end p-4"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}
                      >
                        <h4 className="text-white fw-bold mb-1">{dd.ten}</h4>
                        <p className="text-white-50 mb-0 small">{dd.vungMien}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-2">Tour được yêu thích nhất</h2>
          <div className="row g-4 justify-content-center">
            {featuredLoading && tours.length === 0 && (
              <div className="col-12 text-muted py-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Đang tải tour nổi bật...
              </div>
            )}
            {!featuredLoading && featuredError && tours.length === 0 && (
              <div className="col-12 py-4">
                <div className="alert alert-light mb-0">{featuredError}</div>
              </div>
            )}
            {tours.map((ds) => (
              <div key={ds.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden group position-relative">
                  <div className="img-zoom">
                    <img
                      src={imageUrl(ds.hinhAnh ?? ds.diemDen?.hinhAnh)}
                      className="card-img-top"
                      alt={ds.tieuDe}
                      style={{ width: '100%', height: 250, objectFit: 'cover' }}
                    />
                    {ds.noiBat && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        <i className="bi bi-fire me-1" />
                        HOT TOUR
                      </span>
                    )}
                  </div>
                  <div className="card-body text-start">
                    <h5 className="card-title fw-bold">{ds.tieuDe}</h5>
                    <TourCardStats
                      averageRating={ds.averageRating}
                      ratingCount={ds.ratingCount}
                      bookingCount={ds.bookingCount}
                    />
                    {ds.diemDon?.ten && (
                      <p className="text-muted small mb-2">
                        Khởi hành: <strong>{ds.diemDon.ten}</strong>
                      </p>
                    )}
                    <p className="fw-bold text-danger fs-5 mb-3">{formatVnd(ds.gia)}</p>
                    <Link to={`/tour/${ds.id}`} className="btn btn-primary rounded-pill px-4">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomerReviewsSection />
    </section>
  )
}
