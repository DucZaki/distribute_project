import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNearbyTours } from '../api/tours'
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
  const [tours, setTours] = useState<NearbyTourCard[]>([])
  const [pagination, setPagination] = useState<{
    page: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  } | null>(null)

  const currentParams = useRef<LoadParams>({})
  const currentPage = useRef(0)

  const setStatus = useCallback((html: string, isError = false) => {
    setStatusHtml(html)
    setStatusError(isError)
  }, [])

  const renderTours = useCallback(
    (data: NearbyToursPayload) => {
      const list = data.tours ?? []

      if (data.inRange === false) {
        let farMsg = data.message || 'Không có tour xuất phát gần vị trí của bạn.'
        if (data.nearestDepartureCity != null && data.nearestDistanceKm != null) {
          farMsg += ` Điểm xuất phát gần nhất: <strong>${data.nearestDepartureCity}</strong> (~${data.nearestDistanceKm} km).`
        }
        setStatus(farMsg, false)
        setTours([])
        setPagination(null)
        return
      }

      if (!list.length) {
        setStatus(
          data.message ||
            `Chưa có tour khởi hành từ <strong>${data.departureCity || 'khu vực của bạn'}</strong>.`,
          false,
        )
        setTours([])
        setPagination(null)
        return
      }

      const city = data.departureCity || ''
      const dist = data.distanceKm != null ? ` (~${data.distanceKm} km)` : ''
      setStatus(`Gợi ý tour xuất phát từ <strong>${city}</strong>${dist}.`, false)
      setTours(list)

      const totalPages = Number(data.totalPages || 0)
      const page = Number(data.page || 0)
      if (totalPages > 1) {
        setPagination({
          page,
          totalPages,
          hasPrev: Boolean(data.hasPrev),
          hasNext: Boolean(data.hasNext),
        })
      } else {
        setPagination(null)
      }
    },
    [setStatus],
  )

  const loadNearby = useCallback(
    (params: LoadParams) => {
      setStatus(
        '<span class="spinner-border spinner-border-sm me-2"></span>Đang tìm chuyến đi gần bạn...',
        false,
      )
      setTours([])
      setPagination(null)

      const merged: LoadParams = {
        ...params,
        radiusKm: params.radiusKm ?? NEARBY_RADIUS_KM,
        limit: params.limit ?? PAGE_LIMIT,
        page: params.page ?? 0,
      }
      currentParams.current = merged
      currentPage.current = Number(merged.page ?? 0)

      getNearbyTours(merged)
        .then((data) => renderTours(data as NearbyToursPayload))
        .catch(() => {
          setStatus(
            'Không tải được danh sách tour. Thử chọn thành phố bên cạnh hoặc bấm thử lại.',
            true,
          )
        })
    },
    [renderTours, setStatus],
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
    currentPage.current = target
    loadNearby({ ...currentParams.current, page: target })
  }

  return (
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
              id="nearbyCitySelect"
              style={{ minWidth: 180 }}
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
        </div>

        <div
          id="nearbyToursStatus"
          className={`nearby-status mb-4${statusError ? ' text-danger' : ' text-muted'}`}
          dangerouslySetInnerHTML={{ __html: statusHtml }}
        />

        <div className="row g-4" id="nearbyToursGrid">
          {tours.map((t) => {
            const diemDen = t.diemDen ? ` → ${t.diemDen}` : ''
            return (
              <div key={t.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                  <div className="img-zoom">
                    <img
                      src={imageUrl(t.hinhAnh)}
                      className="card-img-top"
                      alt=""
                      style={{ width: '100%', height: 220, objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
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
              <li className={`page-item${!pagination.hasPrev ? ' disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={!pagination.hasPrev}
                  onClick={() => pagination.hasPrev && goPage(pagination.page - 1)}
                  aria-label="Previous"
                >
                  ‹
                </button>
              </li>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <li key={i} className={`page-item${i === pagination.page ? ' active' : ''}`}>
                  <button type="button" className="page-link" onClick={() => goPage(i)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item${!pagination.hasNext ? ' disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  disabled={!pagination.hasNext}
                  onClick={() => pagination.hasNext && goPage(pagination.page + 1)}
                  aria-label="Next"
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
