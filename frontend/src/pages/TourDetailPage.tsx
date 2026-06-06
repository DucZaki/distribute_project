import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { addFavorite, listFavorites, removeFavorite } from '../api/favorites'
import { getReviewSummary, getTourReviews } from '../api/reviews'
import { fetchFlightQuote, getTour } from '../api/tours'
import { useAuth } from '../auth/AuthContext'
import type { ReviewItem, TourDetail } from '../types/api'
import { getThreeMonthTabs, resolveCalendarView } from '../utils/departureCalendar'
import { formatTourCode } from '../utils/tourCode'
import { formatCountCap99, formatVnd, imageUrl, transportLabel } from '../utils/format'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function inferTransportKind(loai?: string) {
  const t = (loai ?? '').toLowerCase()
  if (t.includes('bus') || t.includes('xe')) return 'bus'
  if (t.includes('train') || t.includes('tàu hỏa') || t.includes('tau')) return 'train'
  if (t.includes('ship') || t.includes('ferry') || t.includes('boat') || t.includes('phà') || t.includes('thủy')) return 'ship'
  if (t.includes('plane') || t.includes('flight') || t.includes('máy bay')) return 'plane'
  return 'plane'
}

function transportIcon(kind: string) {
  if (kind === 'bus') return 'bi-bus-front'
  if (kind === 'train') return 'bi-train-front'
  if (kind === 'ship') return 'bi-tsunami'
  return 'bi-airplane'
}

function transportIconTimeline(kind: string) {
  if (kind === 'bus') return 'bi-bus-front'
  if (kind === 'train') return 'bi-train-front'
  if (kind === 'ship') return 'bi-tsunami'
  return 'bi-airplane'
}

function buildCalendar(month: number, year: number) {
  // Month: 1..12
  const first = new Date(year, month - 1, 1)
  // Convert JS Sunday=0 to Monday=0
  const firstDow = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - firstDow)

  const days: { date: Date; currentMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({ date: d, currentMonth: d.getMonth() === month - 1 })
  }
  return days
}

export function TourDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const tourId = Number(id)

  const [tour, setTour] = useState<TourDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [summary, setSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [weatherOpen, setWeatherOpen] = useState(true)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherHtml, setWeatherHtml] = useState('')
  const [flightQuote, setFlightQuote] = useState<any>(null)
  const [flightQuoteLoading, setFlightQuoteLoading] = useState(false)
  const selectedScheduleId = Number(searchParams.get('nkhId') || searchParams.get('scheduleId') || 0)
  const selectedDate = searchParams.get('selectedDate') || ''
  const monthParam = Number(searchParams.get('month') || 0)
  const yearParam = Number(searchParams.get('year') || 0)

  useEffect(() => {
    if (!tourId || Number.isNaN(tourId)) {
      setLoading(false)
      setLoadError(true)
      return
    }
    setLoading(true)
    setLoadError(false)
    getTour(tourId)
      .then((r) => setTour(r.data))
      .catch(() => {
        setTour(null)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
    getTourReviews(tourId).then((r) => setReviews(r.data.content ?? [])).catch(() => {})
    getReviewSummary(tourId).then((r) => setSummary(r.data)).catch(() => {})
    if (isAuthenticated) {
      listFavorites().then((r) => setFavorited(!!r.data?.some((f) => f.idChuyenDi === tourId))).catch(() => {})
    }
  }, [tourId, isAuthenticated])

  const now = new Date()
  const monthTabs = useMemo(() => getThreeMonthTabs(now), [])
  const { month: viewMonth, year: viewYear } = useMemo(
    () => resolveCalendarView(monthParam, yearParam, now),
    [monthParam, yearParam],
  )

  const departureByDate = useMemo(() => {
    const map = new Map<string, NonNullable<TourDetail['ngayKhoiHanhs']>[number]>()
    for (const s of tour?.ngayKhoiHanhs ?? []) {
      if (s.ngayKhoiHanh) map.set(String(s.ngayKhoiHanh), s)
    }
    return map
  }, [tour?.ngayKhoiHanhs])

  const selectedSchedule = useMemo(() => {
    if (!tour) return undefined
    if (selectedDate) return departureByDate.get(selectedDate)
    if (selectedScheduleId) return tour.ngayKhoiHanhs?.find((s) => s.id === selectedScheduleId)
    return undefined
  }, [departureByDate, selectedDate, selectedScheduleId, tour])

  const transportKind = inferTransportKind(tour?.phuongTien?.loai)
  const quoteTransportKind =
    flightQuote?.transportMode === 'BUS' ? 'bus' : flightQuote?.transportMode === 'FLIGHT' ? 'plane' : transportKind
  const selectedDiemDonId = tour?.diemDon?.id ?? tour?.diemDons?.[0]?.id

  useEffect(() => {
    if (!tourId || !selectedSchedule?.id || !selectedDiemDonId) {
      setFlightQuote(null)
      setFlightQuoteLoading(false)
      return
    }
    let cancelled = false
    setFlightQuoteLoading(true)
    fetchFlightQuote(tourId, selectedSchedule.id, selectedDiemDonId, false)
      .then((r) => {
        if (!cancelled) setFlightQuote(r.data)
      })
      .catch(() => {
        if (!cancelled) setFlightQuote(null)
      })
      .finally(() => {
        if (!cancelled) setFlightQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedDiemDonId, selectedSchedule?.id, tourId, transportKind])

  const calendar = useMemo(() => buildCalendar(viewMonth, viewYear), [viewMonth, viewYear])

  const diemDenLabel = useMemo(() => {
    if (!tour?.diemDen?.ten) return ''
    return tour.diemDen.vungMien
      ? `${tour.diemDen.ten}, ${tour.diemDen.vungMien}`
      : tour.diemDen.ten
  }, [tour?.diemDen])

  async function showWeather(location: string) {
    setWeatherOpen(true)
    setWeatherLoading(true)
    setWeatherHtml(
      `<div class="col-12 text-center py-2"><div class="spinner-border text-primary spinner-border-sm" role="status"></div><span class="ms-2 small">Đang tải dữ liệu thời tiết cho ${location}...</span></div>`,
    )

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=vi&format=json`,
      )
      const geo = await geoRes.json()
      if (!geo.results?.length) {
        setWeatherHtml('<div class="col-12 text-center text-danger small">Không tìm thấy dữ liệu thời tiết cho địa điểm này.</div>')
        return
      }
      const { latitude: lat, longitude: lon, name } = geo.results[0]
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
      )
      const data = await weatherRes.json()
      const daily = data.daily
      const windyBase = `https://www.windy.com/?${lat},${lon},10`

      function icon(code: number) {
        if (code === 0) return '<i class="bi bi-sun text-warning"></i>'
        if (code === 1 || code === 2 || code === 3) return '<i class="bi bi-cloud-sun text-secondary"></i>'
        if (code >= 45 && code <= 48) return '<i class="bi bi-cloud-fog text-secondary"></i>'
        if (code >= 51 && code <= 67) return '<i class="bi bi-cloud-drizzle text-primary"></i>'
        if (code >= 71 && code <= 77) return '<i class="bi bi-snow text-info"></i>'
        if (code >= 80 && code <= 82) return '<i class="bi bi-cloud-rain text-primary"></i>'
        if (code >= 85 && code <= 86) return '<i class="bi bi-cloud-snow text-info"></i>'
        if (code >= 95) return '<i class="bi bi-cloud-lightning-rain text-danger"></i>'
        return '<i class="bi bi-cloud text-secondary"></i>'
      }

      let html = `<div class="col-12 mb-2 weather-heading"><strong class="small text-muted">Thời tiết tại ${name}</strong> &nbsp;<a href="${windyBase}" target="_blank" class="small" style="color:#856404;"><i class="bi bi-box-arrow-up-right"></i> Xem chi tiết</a></div>`

      for (let i = 0; i < daily.time.length; i++) {
        const dateStr = new Date(daily.time[i]).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
        const maxT = Math.round(daily.temperature_2m_max[i])
        const minT = Math.round(daily.temperature_2m_min[i])
        const wCode = Number(daily.weathercode[i])
        html += `
          <div class="col weather-day-col">
            <a href="${windyBase}" target="_blank" class="text-decoration-none">
              <div class="p-2 border rounded h-100 weather-day-card">
                <div class="small fw-bold" style="color:#856404;">${dateStr}</div>
                <div class="fs-4 my-1">${icon(wCode)}</div>
                <div class="small"><span class="text-danger fw-bold">${maxT}°</span> / <span class="text-secondary">${minT}°</span></div>
                <div class="mt-1" style="font-size:0.6rem;color:#aaa;">Xem chi tiết</div>
              </div>
            </a>
          </div>
        `
      }
      setWeatherHtml(html)
    } catch {
      setWeatherHtml('<div class="col-12 text-center text-danger small">Lỗi khi tải dữ liệu thời tiết.</div>')
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    if (!diemDenLabel) return
    showWeather(diemDenLabel).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.id, diemDenLabel])

  async function toggleFavorite() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (favorited) {
      await removeFavorite(tourId)
      setFavorited(false)
    } else {
      await addFavorite(tourId)
      setFavorited(true)
    }
  }

  if (loading) {
    return (
      <div className="container pt-5 tour-detail-container">
        <p className="text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Đang tải tour...
        </p>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="container pt-5 tour-detail-container">
        <p className="text-muted mb-3">
          {loadError ? 'Không tải được thông tin tour. Vui lòng thử lại sau.' : 'Không tìm thấy tour.'}
        </p>
        <Link to="/tour" className="btn btn-primary">
          Xem danh sách tour
        </Link>
      </div>
    )
  }

  const diemDonTen = tour.diemDon?.ten || 'Hà Nội'
  const diemDenDisplay = diemDenLabel || 'Đang cập nhật'
  const defaultDiemDonId = selectedDiemDonId

  function bookingUrl(tourId: number, scheduleId: number) {
    const q = new URLSearchParams({ nkhId: String(scheduleId) })
    if (defaultDiemDonId) q.set('diemDonId', String(defaultDiemDonId))
    return `/tour/${tourId}/dat-tour?${q}`
  }

  const todayIso = toIsoDate(new Date())
  const flightInfo = flightQuote?.available ? flightQuote : selectedSchedule
  const ticketPrice = (Number(flightInfo?.giaVeDi ?? 0) || 0) + (Number(flightInfo?.giaVeVe ?? 0) || 0)
  const totalPerGuest = Number(tour.gia ?? 0) + ticketPrice

  function openTransportModal() {
    const modalEl = document.getElementById('transportModal')
    if (!modalEl) return
    const kind = quoteTransportKind
    const type = tour.phuongTien?.loai ?? ''
    const data: Record<string, { icon: string; title: string; items: [string, string, string][] }> = {
      plane: {
        icon: 'bi-airplane',
        title: 'Lưu ý khi đi máy bay',
        items: [
          ['🧳', 'Hành lý xách tay', 'Tối đa 7kg, kích thước không quá 56x36x23cm.'],
          ['📦', 'Hành lý ký gửi', 'Theo vé, thường 20-23kg. Vượt mức sẽ phụ thu theo hãng.'],
          ['⏱️', 'Có mặt tại sân bay', 'Nội địa trước 60 phút, quốc tế trước 2-3 tiếng.'],
          ['🚫', 'Không mang', 'Chất lỏng >100ml vào cabin, vật sắc nhọn, bật lửa gas.'],
          ['📱', 'Check-in online', 'Mở trước 24h, giúp chọn ghế và tiết kiệm thời gian.'],
          ['🎒', 'Mang theo', 'Giấy tờ còn hạn, vé điện tử, thuốc cá nhân.'],
        ],
      },
      bus: {
        icon: 'bi-bus-front',
        title: 'Lưu ý khi đi xe khách',
        items: [
          ['🧳', 'Hành lý', 'Chỉ mang đồ gọn nhẹ, hạn chế vali cồng kềnh trên xe.'],
          ['⏱️', 'Đúng giờ', 'Có mặt trước 15-30 phút để tránh bị lỡ chuyến.'],
          ['🍬', 'Chống say xe', 'Uống thuốc trước 30 phút, tránh ăn no trước khi lên xe.'],
          ['💧', 'Giữ nước', 'Mang theo nước uống và đồ ăn nhẹ cho hành trình dài.'],
          ['🪟', 'Chọn chỗ ngồi', 'Ngồi giữa xe hoặc phía trước sẽ ít xóc hơn.'],
          ['📵', 'Tuân thủ', 'Giữ ý thức và tôn trọng hành khách khác.'],
        ],
      },
      train: {
        icon: 'bi-train-front',
        title: 'Lưu ý khi đi tàu hỏa',
        items: [
          ['🎫', 'Vé tàu', 'Lưu vé điện tử, kiểm tra số toa và số ghế.'],
          ['⏱️', 'Đúng giờ', 'Có mặt tại ga trước 30 phút, tàu không chờ.'],
          ['🧳', 'Hành lý', 'Để hành lý đúng kệ, tránh cản lối đi.'],
          ['🍱', 'Ăn uống', 'Có thể mang đồ ăn, tránh món nặng mùi trong toa.'],
          ['🪪', 'Giấy tờ', 'Mang giấy tờ tùy thân để đối chiếu khi cần.'],
          ['🌙', 'Giường nằm', 'Mang đồ thoải mái nếu đi hành trình dài.'],
        ],
      },
      ship: {
        icon: 'bi-tsunami',
        title: 'Lưu ý khi đi tàu thủy / phà',
        items: [
          ['🧴', 'Thuốc say sóng', 'Uống trước khi lên tàu 30 phút.'],
          ['🦺', 'Áo phao', 'Quan sát vị trí áo phao và lối thoát hiểm.'],
          ['🧳', 'Hành lý', 'Giữ gọn và cố định để tránh trượt ngã.'],
          ['⏱️', 'Đúng giờ', 'Có mặt tại bến trước 30 phút để làm thủ tục.'],
          ['🌊', 'Thời tiết', 'Theo dõi dự báo thời tiết biển trước chuyến đi.'],
          ['📵', 'An toàn', 'Không đứng ở đầu tàu, không ngồi trên lan can.'],
        ],
      },
    }

    const info = data[kind] ?? data.plane
    const titleEl = document.getElementById('transportModalTitle')
    const bodyEl = document.getElementById('transportModalBody')
    if (titleEl) titleEl.innerHTML = `<i class="bi ${info.icon} me-2"></i>${info.title}`
    if (bodyEl) {
      bodyEl.innerHTML = `<div class="small text-muted mb-2">${type}</div><ul class="list-unstyled mb-0">${info.items
        .map((item, i) => `<li class="${i < info.items.length - 1 ? 'mb-3 ' : ''}d-flex gap-2"><span class="fs-5">${item[0]}</span><div><strong>${item[1]}:</strong> ${item[2]}</div></li>`)
        .join('')}</ul>`
    }

    new window.bootstrap.Modal(modalEl).show()
  }

  function openAudienceModal() {
    const modalEl = document.getElementById('audienceModal')
    if (!modalEl) return
    new window.bootstrap.Modal(modalEl).show()
  }

  function openItineraryModal() {
    const modalEl = document.getElementById('itineraryModal')
    if (!modalEl) return
    new window.bootstrap.Modal(modalEl).show()
  }

  return (
    <div className="container pt-5 tour-detail-container">
      <div className="row" style={{ marginTop: 30 }}>
        <div className="col-lg-8">
          <h1 className="h4 fw-bold">{tour.tieuDe}</h1>
          <p className="text-muted small">Mã tour: {formatTourCode(tour.id)} · {diemDenDisplay}</p>
          <hr />
          <div className="row g-2 tour-gallery mb-4">
            <div className="col-3 d-none d-md-flex flex-column justify-content-start tour-gallery-thumbs">
              {[tour.hinhAnh, tour.diemDen?.hinhAnh].filter(Boolean).slice(0, 3).map((src, i) => (
                <img
                  key={i}
                  src={imageUrl(src)}
                  className="img-fluid rounded mb-2 border"
                  alt=""
                  style={{ height: 90, objectFit: 'cover' }}
                />
              ))}
            </div>
            <div className="col-md-9 col-12 tour-gallery-main">
              <img
                src={imageUrl(tour.hinhAnh ?? tour.diemDen?.hinhAnh)}
                className="img-fluid rounded w-100"
                alt={tour.tieuDe}
                style={{ maxHeight: 420, objectFit: 'cover' }}
              />
            </div>
          </div>

          <div className="card-header bg-white border-0 ps-0">
            <h2 className="h5 fw-bold">LỊCH KHỞI HÀNH</h2>
          </div>

          <div className="card-body p-0">
            <div className="row g-0 schedule-calendar-row">
              <div className="col-3 col-md-2 pe-3 month-switcher">
                {monthTabs.map((m) => {
                  const active = m.month === viewMonth && m.year === viewYear
                  const next = new URLSearchParams(searchParams)
                  next.set('month', String(m.month))
                  next.set('year', String(m.year))
                  next.delete('selectedDate')
                  next.delete('scheduleId')
                  next.delete('nkhId')
                  return (
                    <Link
                      key={`${m.year}-${m.month}`}
                      to={`/tour/${tour.id}?${next.toString()}`}
                      className={`btn w-100 mb-2 small fw-bold ${active ? 'btn-warning active' : 'btn-outline-light border text-dark'}`}
                    >
                      {pad2(m.month)}/{m.year}
                    </Link>
                  )
                })}
              </div>

              <div className="col-9 col-md-10 border rounded p-3 bg-white shadow-sm calendar-panel">
                <div className="text-center mb-4">
                  <span className="fw-bold text-uppercase">THÁNG {pad2(viewMonth)}/{viewYear}</span>
                </div>

                <div className="calendar-grid">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
                    <div key={d} className={`day-label${i === 6 ? ' text-danger' : ''}`}>{d}</div>
                  ))}

                  {calendar.map((day) => {
                    const iso = toIsoDate(day.date)
                    const hasDeparture = departureByDate.has(iso)
                    const pastDay = iso < todayIso
                    const currentMonth = day.currentMonth
                    const selected = iso === selectedDate || (!!selectedSchedule && String(selectedSchedule.ngayKhoiHanh) === iso)
                    const dep = departureByDate.get(iso)
                    const flightPrice = dep ? (Number(dep.giaVeDi ?? 0) || 0) + (Number(dep.giaVeVe ?? 0) || 0) : 0

                    if (hasDeparture && !pastDay && currentMonth) {
                      const next = new URLSearchParams(searchParams)
                      next.set('month', String(viewMonth))
                      next.set('year', String(viewYear))
                      next.set('selectedDate', iso)
                      if (dep?.id) next.set('nkhId', String(dep.id))
                      return (
                        <Link
                          key={iso}
                          to={`/tour/${tour.id}?${next.toString()}`}
                          className={`calendar-day text-decoration-none departure-day${selected ? ' active-day' : ''}`}
                          data-date={iso}
                          title="Ngày khởi hành — bấm để chọn"
                        >
                          <span className="departure-dot" aria-hidden="true" />
                          <span className="day-num">{day.date.getDate()}</span>
                          <span className="departure-tag">Khởi hành</span>
                          {flightPrice > 0 && (
                            <span className="price-sub">{Math.round(flightPrice / 1000)}K</span>
                          )}
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={iso}
                        className={`calendar-day${!currentMonth ? ' other-month' : ''}${pastDay ? ' disabled-day' : ''}`}
                      >
                        <span className="day-num">{day.date.getDate()}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="calendar-legend mt-3 d-flex flex-wrap justify-content-center gap-3 small">
                  <span className="legend-item"><span className="legend-swatch departure-swatch" /> Ngày có chuyến khởi hành</span>
                  <span className="legend-item"><span className="legend-swatch active-swatch" /> Ngày bạn đang chọn</span>
                </div>

                <p className="text-center text-danger mt-4 small fst-italic">
                  <i className="bi bi-info-circle me-1" /> Quý khách vui lòng chọn ngày phù hợp
                </p>
              </div>
            </div>
          </div>

          {selectedSchedule && (
            <div className="mt-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className={`bi ${transportIcon(quoteTransportKind)} me-2`} /> THÔNG TIN CHUYẾN
                    {flightQuote?.transportLabel && (
                      <span className="badge bg-light text-dark ms-2 small">{flightQuote.transportLabel}</span>
                    )}
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="p-4 border-bottom">
                    {flightQuoteLoading && (
                      <div className="small text-muted mb-3">
                        <span className="spinner-border spinner-border-sm me-2" /> Đang lấy giá vận chuyển...
                      </div>
                    )}
                    {!flightQuoteLoading && flightQuote?.message && !flightQuote.available && (
                      <div className="alert alert-warning py-2 small mb-3">{flightQuote.message}</div>
                    )}
                    <div className="d-flex align-items-center mb-3">
                      <span className="badge bg-success me-2 px-3 py-2">CHIỀU ĐI</span>
                      <span className="text-muted small">Ngày {selectedSchedule.ngayKhoiHanh}</span>
                    </div>
                    <div className="row align-items-center">
                      <div className="col-md-3 text-center">
                        <div className="fs-3 fw-bold text-dark">{flightInfo?.gioBayDi || 'N/A'}</div>
                        <div className="small text-muted">{diemDonTen}</div>
                      </div>
                      <div className="col-md-6 text-center">
                        <div className="d-flex align-items-center justify-content-center">
                          <hr className="flex-grow-1" />
                          <i className={`bi ${transportIconTimeline(quoteTransportKind)} text-primary mx-3 fs-5`} />
                          <hr className="flex-grow-1" />
                        </div>
                        <div className="small text-muted">Mã: {flightInfo?.maChuyenBayDi || 'N/A'}</div>
                      </div>
                      <div className="col-md-3 text-center">
                        <div className="fs-3 fw-bold text-dark">{flightInfo?.gioDenDi || 'N/A'}</div>
                        <div className="small text-muted">{diemDenDisplay}</div>
                      </div>
                    </div>
                    <div className="text-end mt-2">
                      <span className="text-danger fw-bold fs-5">{flightInfo?.giaVeDi ? formatVnd(Number(flightInfo.giaVeDi)) : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 border-bottom">
                    <div className="d-flex align-items-center mb-3">
                      <span className="badge bg-info me-2 px-3 py-2">CHIỀU VỀ</span>
                      <span className="text-muted small">{selectedSchedule.ngayKetThuc ? `Ngày ${selectedSchedule.ngayKetThuc}` : 'Chưa xác định'}</span>
                    </div>
                    <div className="row align-items-center">
                      <div className="col-md-3 text-center">
                        <div className="fs-3 fw-bold text-dark">{flightInfo?.gioBayVe || 'N/A'}</div>
                        <div className="small text-muted">{diemDenDisplay}</div>
                      </div>
                      <div className="col-md-6 text-center">
                        <div className="d-flex align-items-center justify-content-center">
                          <hr className="flex-grow-1" />
                          <i className={`bi ${transportIconTimeline(quoteTransportKind)} text-primary mx-3 fs-5`} style={quoteTransportKind === 'plane' ? { transform: 'scaleX(-1)' } : undefined} />
                          <hr className="flex-grow-1" />
                        </div>
                        <div className="small text-muted">Mã: {flightInfo?.maChuyenBayVe || 'N/A'}</div>
                      </div>
                      <div className="col-md-3 text-center">
                        <div className="fs-3 fw-bold text-dark">{flightInfo?.gioDenVe || 'N/A'}</div>
                        <div className="small text-muted">{diemDonTen}</div>
                      </div>
                    </div>
                    <div className="text-end mt-2">
                      <span className="text-danger fw-bold fs-5">{flightInfo?.giaVeVe ? formatVnd(Number(flightInfo.giaVeVe)) : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-6">TỔNG GIÁ VÉ</span>
                      <span className="text-danger fw-bold fs-4">{formatVnd(ticketPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {weatherOpen && (
            <div id="weatherForecastContainer" className="mt-4 rounded border shadow-sm overflow-hidden">
              <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ background: '#ffc107' }}>
                <h3 className="h6 fw-bold mb-0" style={{ color: '#212529' }}>
                  <i className="bi bi-cloud-sun me-2" /> Dự báo thời tiết 5 ngày tới
                </h3>
                <button type="button" className="btn-close btn-sm" onClick={() => setWeatherOpen(false)} aria-label="Đóng" />
              </div>
              <div className="p-3 bg-white">
                <div id="weatherContent" className="row text-center g-2" dangerouslySetInnerHTML={{ __html: weatherHtml }} />
                {!weatherHtml && !weatherLoading && (
                  <div className="text-muted small text-center">Chưa có dữ liệu thời tiết.</div>
                )}
              </div>
            </div>
          )}

          {tour.highlight && (
            <div className="mt-4 p-3 bg-light rounded border-start border-3 border-primary">
              <h3 className="h6 text-primary fw-bold">Điểm nhấn của chương trình</h3>
              <p className="small mb-0 text-muted h7">{tour.highlight}</p>
            </div>
          )}

          <hr />

          <div className="mt-4">
            <h3 className="h5 fw-bold mb-3">ĐÁNH GIÁ CỦA KHÁCH HÀNG</h3>
            <div className="mb-3 d-flex align-items-center gap-3">
              <div className="fs-4 text-warning">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled = (summary?.averageRating ?? 0) >= i + 1
                  return <i key={i} className={`bi ${filled ? 'bi-star-fill' : 'bi-star'}`} />
                })}
              </div>
              <div>
                <strong>{(summary?.averageRating ?? 0).toFixed(1)}/5</strong>
                <span className="text-muted small"> ({formatCountCap99(summary?.totalReviews ?? 0)} đánh giá)</span>
              </div>
            </div>
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body">
                {reviews.length === 0 && <div className="text-muted text-center py-3">Chưa có đánh giá nào cho chuyến đi này.</div>}
                {reviews.map((dg) => (
                  <div key={dg.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{dg.hoTen ?? `Khách hàng #${dg.idNguoiDung}`}</strong>
                        <span className="text-warning ms-2">{dg.diem} ⭐</span>
                      </div>
                      <small className="text-muted">{dg.createdAt ?? ''}</small>
                    </div>
                    <p className="mb-0 mt-2 text-muted">{dg.noiDung}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3 className="h5 fw-bold text-center mt-4 mb-3">THÔNG TIN THÊM VỀ CHUYẾN ĐI</h3>
          <div className="row text-center border-bottom pb-3 mb-3 g-2">
            <div className="col-6 col-lg-3">
              <div className="info-card h-100">
                <i className="bi bi-pin-map fs-3" style={{ color: '#ffc107' }} />
                <p className="mb-1 fw-bold small mt-1">Điểm khởi hành</p>
                <p className="small text-muted mb-0">{diemDonTen}</p>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="info-card" onClick={() => showWeather(diemDenDisplay)}>
                <i className="bi bi-geo-alt fs-3" style={{ color: '#ffc107' }} />
                <p className="mb-1 fw-bold small mt-1">Điểm tham quan</p>
                <p className="small fw-semibold text-dark mb-0">{diemDenDisplay}</p>
                {tour.moTa && <p className="small text-muted mb-0">{tour.moTa}</p>}
                <span className="info-card-hint"><i className="bi bi-cloud-sun me-1" />Xem thời tiết</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="info-card" onClick={openTransportModal}>
                <i className={`bi ${transportIcon(quoteTransportKind)} fs-3`} style={{ color: '#ffc107' }} />
                <p className="mb-1 fw-bold small mt-1">Phương tiện</p>
                <p className="small text-muted mb-0">{flightQuote?.transportLabel ?? tour.phuongTien?.ten ?? transportLabel(tour.phuongTien?.loai)}</p>
                <span className="info-card-hint"><i className="bi bi-info-circle me-1" />Xem lưu ý</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="info-card" onClick={openAudienceModal}>
                <i className="bi bi-people fs-3" style={{ color: '#ffc107' }} />
                <p className="mb-1 fw-bold small mt-1">Đối tượng thích hợp</p>
                <p className="small text-muted mb-0">Cặp đôi, Gia đình, Thanh niên</p>
                <span className="info-card-hint"><i className="bi bi-lightbulb me-1" />Gợi ý hoạt động</span>
              </div>
            </div>
          </div>

          <div className="modal fade" id="transportModal" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header" style={{ background: '#ffc107' }}>
                  <h5 className="modal-title fw-bold" id="transportModalTitle" style={{ color: '#212529' }}>Lưu ý phương tiện</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" />
                </div>
                <div className="modal-body" id="transportModalBody" />
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-sm fw-bold" style={{ background: '#ffc107', color: '#212529' }} data-bs-dismiss="modal">Đã hiểu</button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal fade" id="audienceModal" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header" style={{ background: '#ffc107' }}>
                  <h5 className="modal-title fw-bold" style={{ color: '#212529' }}><i className="bi bi-people me-2" />Gợi ý hoạt động theo nhóm</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 rounded h-100" style={{ background: '#fff8e1', border: '1px solid #ffc107' }}>
                        <div className="fs-2 text-center mb-2">💑</div>
                        <h6 className="fw-bold text-center mb-3">Cặp đôi</h6>
                        <ul className="small text-muted ps-3 mb-0">
                          <li>Bữa tối lãng mạn tại nhà hàng địa phương</li>
                          <li>Chụp ảnh hoàng hôn tại điểm đến</li>
                          <li>Trải nghiệm spa và massage cặp đôi</li>
                          <li>City tour theo lộ trình riêng tư</li>
                          <li>Mua quà lưu niệm đặc trưng</li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded h-100" style={{ background: '#fff8e1', border: '1px solid #ffc107' }}>
                        <div className="fs-2 text-center mb-2">👨‍👩‍👧</div>
                        <h6 className="fw-bold text-center mb-3">Gia đình</h6>
                        <ul className="small text-muted ps-3 mb-0">
                          <li>Khu vui chơi và công viên nước</li>
                          <li>Tham quan bảo tàng, di tích lịch sử</li>
                          <li>Nghỉ khách sạn có hồ bơi gia đình</li>
                          <li>Ăn uống thân thiện với trẻ em</li>
                          <li>Hoạt động trải nghiệm ngoài trời</li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded h-100" style={{ background: '#fff8e1', border: '1px solid #ffc107' }}>
                        <div className="fs-2 text-center mb-2">🧑‍🤝‍🧑</div>
                        <h6 className="fw-bold text-center mb-3">Thanh niên</h6>
                        <ul className="small text-muted ps-3 mb-0">
                          <li>Trekking, leo núi, khám phá thiên nhiên</li>
                          <li>Tour ẩm thực đường phố và món địa phương</li>
                          <li>Check-in điểm sống ảo nổi tiếng</li>
                          <li>Khám phá phố đêm và rooftop view đẹp</li>
                          <li>Thuê xe máy tự khám phá</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-sm fw-bold" style={{ background: '#ffc107', color: '#212529' }} data-bs-dismiss="modal">Tuyệt vời!</button>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h3 className="h5 fw-bold mb-0">LỊCH TRÌNH</h3>
            {!!tour.lichTrinhs?.length && (
              <button type="button" className="btn btn-primary btn-view-itinerary" onClick={openItineraryModal}>
                <i className="bi bi-map me-1" /> Xem lịch trình chi tiết
              </button>
            )}
          </div>

          {!tour.lichTrinhs?.length ? (
            <div className="text-center py-5 schedule-empty">
              <i className="bi bi-calendar-x fs-1 mb-3" />
              <p className="mb-0">Tạm thời chưa có lịch trình cho chuyến đi này</p>
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">Tour <strong>{tour.lichTrinhs.length} ngày</strong> · Bấm nút bên trên để xem đầy đủ</p>
              <div className="itinerary-preview">
                {tour.lichTrinhs.slice(0, 3).map((lich) => (
                  <div key={lich.ngayThu} className="itinerary-preview-item">
                    <div className="itinerary-preview-day"><span>Ngày</span><span>{lich.ngayThu}</span></div>
                    <div className="itinerary-preview-text">
                      <div className="route">{lich.tieuDe}</div>
                      {lich.soBuaAn && (
                        <div className="meals">
                          <i className="bi bi-cup-hot me-1" />
                          <span>{lich.soBuaAn}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="modal fade" id="itineraryModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Lịch trình — {tour.tieuDe}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng" />
                </div>
                <div className="modal-body pt-2 pb-4">
                  <div className="itinerary-timeline-v2">
                    {(tour.lichTrinhs ?? []).map((lich) => (
                      <div key={lich.ngayThu} className="itinerary-day-block">
                        <div className="itinerary-pin"><i className="bi bi-geo-alt-fill" /></div>
                        <div className="itinerary-card">
                          <div className="itinerary-card-header">
                            <div className="itinerary-card-header-text">
                              <div className="itinerary-day-label">Ngày {lich.ngayThu}</div>
                              <div className="itinerary-route">{lich.tieuDe}</div>
                              {lich.soBuaAn && (
                                <div className="itinerary-meals">
                                  <i className="bi bi-cup-hot me-1" />
                                  <span>{lich.soBuaAn}</span>
                                </div>
                              )}
                            </div>
                            <img className="itinerary-day-img" alt="" src={imageUrl(lich.hinhAnh ?? tour.hinhAnh)} />
                          </div>
                          <div className="itinerary-card-body">
                            {lich.hoatDongChinh && (
                              <p className="itinerary-main-activity">
                                <strong>Hoạt động chính:</strong> <span>{lich.hoatDongChinh}</span>
                              </p>
                            )}
                            {(lich.noiDungLines?.length ?? 0) > 0 && (
                              <ul className="itinerary-activity-list">
                                {lich.noiDungLines!.map((line, idx) => (
                                  <li key={idx}>{line}</li>
                                ))}
                              </ul>
                            )}
                            {!lich.noiDungLines?.length && lich.moTa && (
                              <p className="itinerary-main-activity"><span>{lich.moTa}</span></p>
                            )}
                            {lich.nghiDem && (
                              <p className="itinerary-sleep">
                                <i className="bi bi-moon-stars me-1" />
                                Nghỉ đêm tại <span>{lich.nghiDem}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-3 sticky-price-box sticky-top" style={{ top: 100 }}>
            <div className="card-body">
              <p className="small text-muted mb-3 pb-3 border-bottom">
                <i className="bi bi-pin-map me-1" /> Điểm khởi hành: <strong>{diemDonTen}</strong>
              </p>
              <p className="mb-0 text-secondary small">Giá từ:</p>

              {!selectedSchedule ? (
                <>
                  <h2 className="card-title text-danger fw-bold">{formatVnd(Number(tour.gia))} <span className="small text-secondary">/Khách</span></h2>
                  <p className="small text-muted mb-3">
                    <i className="bi bi-info-circle me-1" /> Vui lòng chọn ngày khởi hành trên lịch
                  </p>
                  <button className="btn btn-primary w-100 mb-2 py-2 fw-bold" disabled>
                    <i className="bi bi-calendar-check me-2" /> Chọn ngày khởi hành
                  </button>
                </>
              ) : (
                <>
                  <h2 className="card-title text-danger fw-bold">{formatVnd(totalPerGuest)} <span className="small text-secondary">/Khách</span></h2>
                  <div className="small text-muted mb-1">
                    <span>Giá dịch vụ: </span>
                    <strong>{formatVnd(Number(tour.gia))}</strong>
                  </div>
                  <div className="small text-muted mb-3">
                    <span>Vé: </span>
                    <strong>{formatVnd(ticketPrice)}</strong>
                    {flightQuoteLoading && <span className="ms-1">(đang cập nhật)</span>}
                  </div>
                  <p className="small text-muted mb-2"><i className="bi bi-calendar3 me-1" /> Ngày đi: <strong>{selectedSchedule.ngayKhoiHanh}</strong></p>
                  <p className="small text-muted mb-2"><i className="bi bi-calendar3 me-1" /> Ngày về: <strong>{selectedSchedule.ngayKetThuc ?? 'N/A'}</strong></p>
                  <p className="small text-muted mb-2">
                    <i className={`bi ${transportIcon(quoteTransportKind)} me-1`} /> Chuyến đi: <strong>{flightInfo?.maChuyenBayDi ?? 'N/A'}</strong>
                    {flightInfo?.gioBayDi && flightInfo?.gioDenDi ? ` (${flightInfo.gioBayDi} -> ${flightInfo.gioDenDi})` : ''}
                  </p>
                  <p className="small text-muted mb-3">
                    <i className={`bi ${transportIcon(quoteTransportKind)} me-1`} style={quoteTransportKind === 'plane' ? { transform: 'scaleX(-1)', display: 'inline-block' } : undefined} /> Chuyến về: <strong>{flightInfo?.maChuyenBayVe ?? 'N/A'}</strong>
                    {flightInfo?.gioBayVe && flightInfo?.gioDenVe ? ` (${flightInfo.gioBayVe} -> ${flightInfo.gioDenVe})` : ''}
                  </p>

                  <button
                    type="button"
                    className="btn btn-danger w-100 mb-2 py-2 fw-bold"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login', { state: { from: bookingUrl(tour.id, selectedSchedule.id) } })
                        return
                      }
                      navigate(bookingUrl(tour.id, selectedSchedule.id))
                    }}
                  >
                    <i className="bi bi-cart-check me-2" /> ĐẶT NGAY
                  </button>
                </>
              )}

              <button
                type="button"
                className={`btn w-100 mb-2 ${favorited ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={toggleFavorite}
              >
                <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'}`} /> Yêu thích
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedSchedule && (
        <div className="mobile-sticky-cta">
          <div>
            <div className="small text-muted">Giá từ / khách</div>
            <div className="fw-bold text-danger">{formatVnd(totalPerGuest)}</div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: bookingUrl(tour.id, selectedSchedule.id) } })
                return
              }
              navigate(bookingUrl(tour.id, selectedSchedule.id))
            }}
          >
            Đặt ngay
          </button>
        </div>
      )}
    </div>
  )
}
