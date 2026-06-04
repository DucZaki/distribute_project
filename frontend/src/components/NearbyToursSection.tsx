import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNearbyTours } from '../api/tours'
import { TourCardStats } from './TourCardStats'
import { formatVnd, imageUrl } from '../utils/format'

const NEARBY_RADIUS_KM = 100
const PAGE_LIMIT = 6

export interface NearbyTourCard {
  id: number
  tieuDe?: string
  gia?: number
  hinhAnh?: string
  diemDon?: string
  diemDen?: string
  distanceKm?: number
  noiBat?: boolean
  averageRating?: number
  ratingCount?: number
  bookingCount?: number
}

export interface NearbyToursPayload {
  tours?: NearbyTourCard[]
  inRange?: boolean
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasPrev?: boolean
  hasNext?: boolean
  message?: string
  departureCity?: string
  distanceKm?: number
  nearestDepartureCity?: string
  nearestDistanceKm?: number
}

type LoadParams = {
  lat?: number
  lng?: number
  city?: string
  page?: number
  radiusKm?: number
  limit?: number
}

/**
 * Khối "Chuyến đi gần bạn" — giống monolith index.html + nearby-tours.js.
 */
export function NearbyToursSection() {
  const [statusHtml, setStatusHtml] = useState(
    '<span class="spinner-border spinner-border-sm me-2"></span>Đang lấy vị trí...',
  )
  const [statusError, setStatusError] = useState(false)
  const [allTours, setAllTours] = useState<NearbyTourCard[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentParams = useRef<LoadParams>({})

  const setStatus = useCallback((html: string, isError = false) => {
    setStatusHtml(html)
    setStatusError(isError)
  }, [])

  const renderTours = useCallback(
    (data: NearbyToursPayload) => {
      setLoading(false)
      const list = data.tours ?? []

      if (data.inRange === false) {
        let farMsg = data.message || 'Không có tour xuất phát gần vị trí của bạn.'
        if (data.nearestDepartureCity != null && data.nearestDistanceKm != null) {
          farMsg += ` Điểm xuất phát gần nhất: <strong>${data.nearestDepartureCity}</strong> (~${data.nearestDistanceKm} km).`
        }
        setStatus(farMsg, false)
        setAllTours([])
        setCurrentPage(0)
        return
      }

      if (!list.length) {
        setStatus(
          data.message ||
            `Chưa có tour khởi hành từ <strong>${data.departureCity || 'khu vực của bạn'}</strong>.`,
          false,
        )
        setAllTours([])
        setCurrentPage(0)
        return
      }

      const city = data.departureCity || ''
      const dist = data.distanceKm != null ? ` (~${data.distanceKm} km)` : ''
      setStatus(`Gợi ý tour xuất phát từ <strong>${city}</strong>${dist}.`, false)
      setAllTours(list)
      setCurrentPage(0)
    },
    [setStatus, setLoading],
  )

  const loadNearby = useCallback(
    (params: LoadParams) => {
      setStatus(
        '<span class="spinner-border spinner-border-sm me-2"></span>Đang tìm chuyến đi gần bạn...',
        false,
      )
      setLoading(true)
      setAllTours([])
      setCurrentPage(0)

      const merged: LoadParams = {
        ...params,
        radiusKm: params.radiusKm ?? NEARBY_RADIUS_KM,
        limit: 100, // Fetch up to 100 tours at once
        page: 0,
      }
      currentParams.current = merged

      getNearbyTours(merged)
        .then((data) => renderTours(data as NearbyToursPayload))
        .catch(() => {
          setLoading(false)
          setStatus(
            'Không tải được danh sách tour. Thử chọn thành phố bên cạnh hoặc bấm thử lại.',
            true,
          )
        })
    },
    [renderTours, setStatus, setLoading],
  )

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('Trình duyệt không hỗ trợ định vị. Hãy chọn thành phố bên cạnh.', true)
      return
    }
    setStatus('<span class="spinner-border spinner-border-sm me-2"></span>Đang lấy vị trí...', false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadNearby({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          page: 0,
        })
      },
      () => {
        setStatus('Bạn đã từ chối chia sẻ vị trí. Chọn thành phố xuất phát bên cạnh.', true)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }, [loadNearby, setStatus])

  useEffect(() => {
    requestGeolocation()
  }, [requestGeolocation])

  function goPage(target: number) {
    if (target === currentPage || isTransitioning || loading) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage(target)
      setIsTransitioning(false)
    }, 200)
  }

  const tours = allTours.slice(currentPage * PAGE_LIMIT, (currentPage + 1) * PAGE_LIMIT)
  const totalPages = Math.ceil(allTours.length / PAGE_LIMIT)
  const pagination = totalPages > 1 ? {
    page: currentPage,
    totalPages,
    hasPrev: currentPage > 0,
    hasNext: currentPage < totalPages - 1,
  } : null

  return (
    <section className="py-5 home-section-nearby" id="nearbyToursSection">
      <div className="container">
        <div className="text-center mb-4 mx-auto animate-fade-in" style={{ maxWidth: '680px' }}>
          <span className="text-primary fw-bold text-uppercase ls-wide mb-2 d-inline-block">Gần bạn</span>
          <h2 className="fw-800 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            Chuyến đi gần bạn
          </h2>
          <p className="text-muted mb-0">Tour khởi hành từ điểm đón gần vị trí hiện tại của bạn</p>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
          <select
            className="form-select"
            id="nearbyCitySelect"
            style={{ width: 'auto', minWidth: 180 }}
            defaultValue=""
            aria-label="Chọn thành phố xuất phát"
            onChange={(e) => {
              if (e.target.value) {
                loadNearby({ city: e.target.value, page: 0 })
              }
            }}
          >
            <option value="">Hoặc chọn thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
          <button
            type="button"
            className="btn btn-outline-primary"
            id="nearbyRetryBtn"
            onClick={requestGeolocation}
          >
            <i className="bi bi-crosshair" /> Dùng vị trí của tôi
          </button>
        </div>

        <div
          id="nearbyToursStatus"
          className={`nearby-status text-center mb-4${statusError ? ' text-danger' : ' text-muted'}`}
          dangerouslySetInnerHTML={{ __html: statusHtml }}
        />

        <div
          className="row g-4"
          id="nearbyToursGrid"
          style={{
            opacity: isTransitioning || loading ? 0 : 1,
            transform: isTransitioning || loading ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            minHeight: tours.length > 0 ? '600px' : 'auto',
          }}
        >
          {tours.map((t) => {
            const diemDen = t.diemDen ? ` → ${t.diemDen}` : ''
            return (
              <div key={t.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative">
                  <div className="img-zoom">
                    <img
                      src={imageUrl(t.hinhAnh)}
                      className="card-img-top"
                      alt=""
                      style={{ width: '100%', height: 220, objectFit: 'cover' }}
                    />
                    {t.noiBat && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        <i className="bi bi-fire me-1" />
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column text-start">
                    {t.distanceKm != null && (
                      <span className="badge bg-light text-dark border mb-2 align-self-start">
                        <i className="bi bi-crosshair me-1" />
                        {t.distanceKm} km
                      </span>
                    )}
                    <span className="badge bg-primary-subtle text-primary mb-2 align-self-start">
                      <i className="bi bi-geo-alt-fill" /> {t.diemDon || 'Điểm đón'}
                      {diemDen}
                    </span>
                    <h5 className="card-title fw-bold">{t.tieuDe || 'Tour'}</h5>
                    <TourCardStats
                      averageRating={t.averageRating}
                      ratingCount={t.ratingCount}
                      bookingCount={t.bookingCount}
                    />
                    <p className="fw-bold text-danger fs-5 mb-3">{formatVnd(Number(t.gia ?? 0))}</p>
                    <Link
                      to={`/tour/${t.id}`}
                      className="btn btn-primary rounded-pill mt-auto align-self-start px-4"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4" id="nearbyToursPagination">
            <ul className="pagination zaki-pagination mb-0">
              <li className={`page-item${!pagination.hasPrev || loading || isTransitioning ? ' disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={!pagination.hasPrev || loading || isTransitioning}
                  onClick={() => pagination.hasPrev && !loading && !isTransitioning && goPage(pagination.page - 1)}
                  aria-label="Trước"
                >
                  ‹
                </button>
              </li>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <li key={i} className={`page-item${i === pagination.page ? ' active' : ''}${loading || isTransitioning ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={loading || isTransitioning}
                    onClick={() => !loading && !isTransitioning && goPage(i)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item${!pagination.hasNext || loading || isTransitioning ? ' disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={!pagination.hasNext || loading || isTransitioning}
                  onClick={() => pagination.hasNext && !loading && !isTransitioning && goPage(pagination.page + 1)}
                  aria-label="Tiếp"
                >
                  ›
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
