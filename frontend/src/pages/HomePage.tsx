import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFeaturedDestinations, getFeaturedTours, getNearbyTours } from '../api/tours'
import { getTourReviews } from '../api/reviews'
import type { DiemDenSummary, ReviewItem, TourSummary } from '../types/api'
import { formatVnd, imageUrl } from '../utils/format'

export function HomePage() {
  const navigate = useNavigate()
  const [tours, setTours] = useState<TourSummary[]>([])
  const [destinations, setDestinations] = useState<DiemDenSummary[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [nearbyTours, setNearbyTours] = useState<TourSummary[]>([])
  const [nearbyStatus, setNearbyStatus] = useState('Chọn thành phố hoặc dùng vị trí của bạn')
  const [nearbyCity, setNearbyCity] = useState('')

  useEffect(() => {
    getFeaturedTours().then((r) => {
      setTours(r.data ?? [])
      const first = r.data?.[0]
      if (first) {
        getTourReviews(first.id).then((rev) => setReviews(rev.data.content ?? [])).catch(() => {})
      }
    })
    getFeaturedDestinations().then((r) => setDestinations(r.data ?? []))
  }, [])

  function loadNearby(city: string) {
    if (!city) return
    setNearbyStatus('Đang tải tour...')
    getNearbyTours({ city, size: 6 })
      .then((r) => {
        setNearbyTours(r.data.content ?? [])
        setNearbyStatus(
          r.data.content?.length
            ? `Gợi ý tour xuất phát từ ${city}`
            : `Chưa có tour khởi hành từ ${city}`,
        )
      })
      .catch(() => setNearbyStatus('Không tải được tour gần bạn'))
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      loadNearby(nearbyCity || 'Hà Nội')
      return
    }
    setNearbyStatus('Đang lấy vị trí...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getNearbyTours({ lat: pos.coords.latitude, lng: pos.coords.longitude, city: nearbyCity || undefined, radiusKm: 100, size: 6 })
          .then((r) => {
            setNearbyTours(r.data.content ?? [])
            setNearbyStatus(r.data.content?.length ? 'Gợi ý tour gần vị trí của bạn' : 'Chưa có tour gần vị trí của bạn')
          })
          .catch(() => setNearbyStatus('Không tải được tour gần bạn'))
      },
      () => loadNearby(nearbyCity || 'Hà Nội'),
    )
  }

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

      <section className="py-5 bg-white" id="nearbyToursSection">
        <div className="container">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <div>
              <h6 className="text-primary fw-bold text-uppercase ls-wide">Gần bạn</h6>
              <h2 className="fw-800 mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
                Chuyến đi gần bạn
              </h2>
              <p className="text-muted mb-0 mt-2">Tour khởi hành từ điểm đón gần vị trí hiện tại của bạn</p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <select
                className="form-select"
                style={{ minWidth: 180 }}
                value={nearbyCity}
                onChange={(e) => setNearbyCity(e.target.value)}
              >
                <option value="">Hoặc chọn thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
              <button type="button" className="btn btn-outline-primary" onClick={() => loadNearby(nearbyCity || 'Hà Nội')}>
                Tìm theo thành phố
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={useMyLocation}>
                <i className="bi bi-crosshair" /> Dùng vị trí của tôi
              </button>
            </div>
          </div>
          <div className="nearby-status mb-4 text-muted">{nearbyStatus}</div>
          <div className="row g-4">
            {nearbyTours.map((t) => (
              <div key={t.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                  <img src={imageUrl(t.hinhAnh)} alt="" style={{ height: 200, objectFit: 'cover', width: '100%' }} />
                  <div className="card-body">
                    <h5 className="fw-bold">{t.tieuDe}</h5>
                    <p className="text-danger fw-bold">{formatVnd(t.gia)}</p>
                    <Link to={`/tour/${t.id}`} className="btn btn-primary rounded-pill btn-sm">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <h2 className="fw-bold mb-4">Tour được yêu thích nhất</h2>
          <div className="row g-4">
            {tours.map((ds) => (
              <div key={ds.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden group">
                  <div className="img-zoom">
                    <img
                      src={imageUrl(ds.hinhAnh ?? ds.diemDen?.hinhAnh)}
                      className="card-img-top"
                      alt={ds.tieuDe}
                      style={{ width: '100%', height: 250, objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{ds.tieuDe}</h5>
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

      {reviews.length > 0 && (
        <section className="py-5 text-center bg-light">
          <div className="container">
            <h2 className="fw-bold mb-4">Khách hàng nói gì?</h2>
            <div id="reviewCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval={5000}>
              <div className="carousel-inner">
                {reviews.map((r, i) => (
                  <div key={r.id} className={`carousel-item${i === 0 ? ' active' : ''}`}>
                    <Link to={`/tour/${r.idChuyenDi}`} className="text-decoration-none">
                      <blockquote className="blockquote" style={{ background: 'none', color: '#000' }}>
                        <p className="mb-4 fw-bolder" style={{ marginBottom: 0 }}>
                          {(r.tourTitle ?? `Tour #${r.idChuyenDi}`) + ':'}
                        </p>
                        <p className="mb-4" style={{ marginBottom: 0 }}>{r.noiDung}</p>
                        <footer className="blockquote-footer">{r.hoTen ?? `Khách hàng #${r.idNguoiDung}`}</footer>
                      </blockquote>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}
