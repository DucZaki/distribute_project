import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, myBookings, redirectToVnPay } from '../api/bookings'
import { createReview } from '../api/reviews'
import { getTour } from '../api/tours'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { TourItineraryTimeline } from '../components/TourItineraryTimeline'
import { UserSidebar } from '../components/UserSidebar'
import { formatVnd, imageUrl } from '../utils/format'

const PAGE_SIZE = 5

type Booking = {
  id: number
  idChuyenDi: number
  soLuong?: number
  createdAt?: string
  trangThai?: string
  tongGia?: number
  maCheckIn?: string
}

type TourInfo = {
  tieuDe?: string
  hinhAnh?: string
  ngayKetThuc?: string
  ngayKhoiHanh?: string
  moTa?: string
  highlight?: string
  gia?: number
  phuongTien?: { ten?: string; loai?: string }
  diemDen?: { ten?: string }
  lichTrinhs?: Array<{
    id?: number
    ngayThu?: number
    tieuDe?: string
    soBuaAn?: string
    hoatDongChinh?: string
    noiDungLines?: string[]
    noiDung?: string
    moTa?: string
    nghiDem?: string
    hinhAnh?: string
  }>
  diemDons?: Array<{ ten?: string }>
  ghiChu?: string
}

type EnrichedBooking = Booking & { tour?: TourInfo }

type TabId = 'all' | 'pending' | 'paid' | 'failed'

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('vi-VN')
}

function formatTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function isPendingExpired(createdAt?: string) {
  if (!createdAt) return false
  const deadline = new Date(createdAt).getTime() + 15 * 60 * 1000
  return Date.now() > deadline
}

function canReview(tour?: TourInfo) {
  if (!tour?.ngayKetThuc) return false
  const end = new Date(tour.ngayKetThuc)
  if (Number.isNaN(end.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return end.getTime() <= today.getTime()
}

function statusBadge(booking: Booking) {
  if (booking.trangThai === 'PENDING' && isPendingExpired(booking.createdAt)) {
    return <span className="badge rounded-pill px-3 py-2 bg-danger">HẾT HẠN</span>
  }
  const cls =
    booking.trangThai === 'PAID' || booking.trangThai === 'CONFIRMED'
      ? 'bg-success'
      : booking.trangThai === 'PENDING'
        ? 'bg-warning text-dark'
        : 'bg-danger'
  const label =
    booking.trangThai === 'PAID' || booking.trangThai === 'CONFIRMED'
      ? 'Đã thanh toán'
      : booking.trangThai === 'PENDING'
        ? 'Chờ thanh toán'
        : booking.trangThai === 'CANCELLED'
          ? 'Đã huỷ'
          : 'Thất bại'
  return <span className={`badge rounded-pill px-3 py-2 ${cls}`}>{label}</span>
}

const STAR_DATA: Record<number, { emoji: string; text: string; cls: string }> = {
  1: { emoji: '😞', text: 'Tệ', cls: 'rating-1' },
  2: { emoji: '😐', text: 'Không hài lòng', cls: 'rating-2' },
  3: { emoji: '😊', text: 'Bình thường', cls: 'rating-3' },
  4: { emoji: '😄', text: 'Hài lòng', cls: 'rating-4' },
  5: { emoji: '🤩', text: 'Tuyệt vời!', cls: 'rating-5' },
}

function BookingPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i += 1) pages.push(i)
  return (
    <div className="booking-pagination">
      <button
        type="button"
        className={`pg-btn${page <= 1 ? ' disabled' : ''}`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <i className="bi bi-chevron-left" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pg-btn${p === page ? ' active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={`pg-btn${page >= totalPages ? ' disabled' : ''}`}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <i className="bi bi-chevron-right" />
      </button>
      <span className="pg-info">
        Trang {page}/{totalPages}
      </span>
    </div>
  )
}

export function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [tab, setTab] = useState<TabId>('all')
  const [pages, setPages] = useState<Record<TabId, number>>({ all: 1, pending: 1, paid: 1, failed: 1 })
  const [payError, setPayError] = useState('')
  const [payingId, setPayingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const invoiceRef = useRef<HTMLDivElement>(null)
  const itineraryRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<{
    id: number
    user: string
    tour: string
    people: number
    total: number
    date: string
  } | null>(null)

  const [itinerary, setItinerary] = useState<{
    loading: boolean
    tour?: TourInfo
  }>({ loading: false })

  const [review, setReview] = useState<{
    tourId: number
    tourTitle: string
    diem: number
    noiDung: string
    submitting: boolean
    error: string
    success: string
  } | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const all: Booking[] = []
      let page = 0
      while (true) {
        const res = await myBookings(page, 50)
        const chunk = res.data?.content ?? []
        all.push(...chunk)
        if (res.data?.last || chunk.length === 0) break
        page += 1
      }
      const enriched = await Promise.all(
        all.map(async (b) => {
          try {
            const t = await getTour(b.idChuyenDi)
            return { ...b, tour: t.data as TourInfo }
          } catch {
            return { ...b }
          }
        }),
      )
      setBookings(enriched)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const grouped = useMemo(() => {
    const g: Record<TabId, EnrichedBooking[]> = { all: bookings, pending: [], paid: [], failed: [] }
    for (const b of bookings) {
      const st = b.trangThai ?? ''
      const expired = st === 'PENDING' && isPendingExpired(b.createdAt)
      if (st === 'PENDING' && !expired) g.pending.push(b)
      if (st === 'PAID' || st === 'CONFIRMED') g.paid.push(b)
      if (st === 'FAILED' || expired) g.failed.push(b)
    }
    return g
  }, [bookings])

  async function handlePay(bookingId: number) {
    setPayError('')
    setPayingId(bookingId)
    try {
      await redirectToVnPay(bookingId, true)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 401
            ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
            : err.message
          : 'Không thể mở VNPay'
      setPayError(msg)
      setPayingId(null)
    }
  }

  function openInvoice(b: EnrichedBooking) {
    setInvoice({
      id: b.id,
      user: user?.hoTen ?? '—',
      tour: b.tour?.tieuDe ?? `Tour #${b.idChuyenDi}`,
      people: b.soLuong ?? 1,
      total: Number(b.tongGia) || 0,
      date: formatDate(b.createdAt),
    })
    if (invoiceRef.current && window.bootstrap) {
      new window.bootstrap.Modal(invoiceRef.current).show()
    }
  }

  async function openItinerary(tourId: number) {
    setItinerary({ loading: true })
    if (itineraryRef.current && window.bootstrap) {
      new window.bootstrap.Modal(itineraryRef.current).show()
    }
    try {
      const res = await getTour(tourId)
      setItinerary({ loading: false, tour: res.data as TourInfo })
    } catch {
      setItinerary({ loading: false })
    }
  }

  function openReview(b: EnrichedBooking) {
    setReview({
      tourId: b.idChuyenDi,
      tourTitle: b.tour?.tieuDe ?? `Tour #${b.idChuyenDi}`,
      diem: 5,
      noiDung: '',
      submitting: false,
      error: '',
      success: '',
    })
    if (reviewRef.current && window.bootstrap) {
      new window.bootstrap.Modal(reviewRef.current).show()
    }
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault()
    if (!review) return
    setReview({ ...review, submitting: true, error: '', success: '' })
    try {
      await createReview(review.tourId, review.diem, review.noiDung)
      setReview({ ...review, submitting: false, success: 'Gửi đánh giá thành công!' })
      setTimeout(() => {
        if (reviewRef.current && window.bootstrap) {
          window.bootstrap.Modal.getInstance(reviewRef.current)?.hide()
        }
        setReview(null)
      }, 1200)
    } catch (ex) {
      setReview({
        ...review,
        submitting: false,
        error: ex instanceof ApiError ? ex.message : 'Không gửi được đánh giá',
      })
    }
  }

  function renderList(tabId: TabId) {
    const list = grouped[tabId]
    const currentPage = pages[tabId]
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
    const slice = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Đang tải đơn đặt chỗ...</p>
        </div>
      )
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border empty-state-box">
          <div className="empty-state-icon mb-3">
            <i className="bi bi-calendar-x" />
          </div>
          <h6 className="fw-bold text-dark mb-1">Không có đơn nào</h6>
          <p className="text-muted small mb-0">
            {tabId === 'all' ? 'Bạn chưa có đơn đặt chỗ nào.' : 'Không có đơn đặt chỗ nào ở trạng thái này.'}
          </p>
        </div>
      )
    }

    return (
      <>
        <div className="booking-list-container">
          {slice.map((b) => {
            const expired = b.trangThai === 'PENDING' && isPendingExpired(b.createdAt)
            const deadline = b.createdAt ? new Date(new Date(b.createdAt).getTime() + 15 * 60 * 1000) : null
            return (
              <div key={b.id} className="col-12 booking-item">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 booking-card booking-history-card">
                  <div className="row g-0">
                    <div className="col-md-3 booking-img-wrap">
                      <img
                        src={imageUrl(b.tour?.hinhAnh)}
                        className="booking-thumb"
                        alt={b.tour?.tieuDe ?? 'Tour'}
                      />
                    </div>
                    <div className="col-md-9">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-bold mb-0">{b.tour?.tieuDe ?? `Tour #${b.idChuyenDi}`}</h5>
                          {statusBadge(b)}
                        </div>
                        <div className="row g-3 small text-muted mb-3">
                          <div className="col-sm-6">
                            <i className="bi bi-calendar-check me-1" />
                            Ngày đặt: {formatDate(b.createdAt)}
                          </div>
                          <div className="col-sm-6">
                            <i className="bi bi-people me-1" />
                            Số lượng: {b.soLuong ?? 0} khách
                          </div>
                          {b.trangThai === 'PENDING' && deadline && !expired && (
                            <div className="col-sm-6">
                              <i className="bi bi-clock me-1 text-danger" />
                              Thời hạn:{' '}
                              <span className="text-danger fw-bold">{formatTime(deadline.toISOString())}</span>
                            </div>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-3 border-top booking-card-actions">
                          <div>
                            <span className="text-muted small">Tổng:</span>
                            <h5 className="text-danger fw-bold mb-0 d-inline ms-2">{formatVnd(b.tongGia)}</h5>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            {b.trangThai === 'PENDING' && !expired && (
                              <button
                                type="button"
                                className="btn btn-primary rounded-pill btn-sm px-4"
                                disabled={payingId === b.id}
                                onClick={() => handlePay(b.id)}
                              >
                                {payingId === b.id ? 'Đang chuyển VNPay...' : 'Thanh toán ngay'}
                              </button>
                            )}
                            {b.trangThai === 'PENDING' && !expired && (
                              <button
                                type="button"
                                className="btn btn-outline-danger rounded-pill btn-sm"
                                onClick={() => cancelBooking(b.id).then(reload)}
                              >
                                Huỷ
                              </button>
                            )}
                            {(b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED') && canReview(b.tour) && (
                              <button
                                type="button"
                                className="btn btn-outline-warning rounded-pill btn-sm px-4"
                                onClick={() => openReview(b)}
                              >
                                <i className="bi bi-star me-1" />
                                Đánh giá
                              </button>
                            )}
                            {(b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED') && (
                              <button
                                type="button"
                                className="btn btn-light border rounded-pill btn-sm px-3"
                                onClick={() => openInvoice(b)}
                              >
                                <i className="bi bi-file-earmark-text me-1" />
                                Hoá đơn
                              </button>
                            )}
                            {(b.trangThai === 'PAID' || b.trangThai === 'CONFIRMED') && (
                              <button
                                type="button"
                                className="btn btn-outline-info rounded-pill btn-sm px-3"
                                onClick={() => openItinerary(b.idChuyenDi)}
                              >
                                <i className="bi bi-map me-1" />
                                Lịch trình
                              </button>
                            )}
                            <Link to={`/tour/${b.idChuyenDi}`} className="btn btn-outline-primary rounded-pill btn-sm px-3">
                              Chi tiết tour
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <BookingPagination
          page={currentPage}
          totalPages={totalPages}
          onChange={(p) => setPages((prev) => ({ ...prev, [tabId]: p }))}
        />
      </>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ thanh toán' },
    { id: 'paid', label: 'Đã thanh toán' },
    { id: 'failed', label: 'Thất bại/Hết hạn' },
  ]

  const starInfo = review ? STAR_DATA[review.diem] : STAR_DATA[5]

  return (
    <div className="container user-page-shell user-bookings-page">
      <div className="mb-3">
        <Link to="/" className="text-decoration-none text-dark small fw-bold">
          <i className="bi bi-arrow-left me-1" />
          Quay lại trang chủ
        </Link>
      </div>
      <div className="row">
        <UserSidebar active="bookings" showTierProgress={false} />
        <div className="col-lg-9">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-luggage-fill text-booking-primary fs-3 me-2" />
            <h3 className="fw-bold mb-0">Lịch sử đặt chỗ của tôi</h3>
          </div>
          {payError && <div className="alert alert-danger">{payError}</div>}

          <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm small fw-bold">
            {tabs.map((t) => (
              <li key={t.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill text-dark${tab === t.id ? ' active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          {renderList(tab)}
        </div>
      </div>

      {/* Invoice modal */}
      <div className="modal fade" ref={invoiceRef} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold mb-0">Chi tiết Hoá đơn</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body p-4">
              {invoice && (
                <>
                  <div className="text-center mb-4">
                    <div className="display-6 fw-bold text-dark">{formatVnd(invoice.total)}</div>
                    <div className="badge bg-success rounded-pill px-3 py-1 mt-2">Thành công</div>
                  </div>
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Mã đơn hàng:</span>
                      <span className="fw-bold">#{invoice.id}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Người đặt:</span>
                      <span className="fw-bold">{invoice.user}</span>
                    </div>
                    <hr />
                    <div className="mb-3 text-center">
                      <span className="text-muted d-block mb-1 small">Tour đã đặt:</span>
                      <div className="fw-bold text-primary">{invoice.tour}</div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Số lượng:</span>
                      <span className="fw-bold">{invoice.people} người</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Ngày đặt:</span>
                      <span className="fw-bold">{invoice.date}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Phương thức:</span>
                      <span className="fw-bold">Chuyển khoản / VNPay</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-light rounded-3 text-center small text-muted">
                    <i className="bi bi-info-circle me-1" />
                    Cảm ơn bạn đã tin tưởng ZakiBooking. Chúc bạn có một chuyến đi tuyệt vời!
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-dark rounded-pill w-100 py-2" data-bs-dismiss="modal">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary modal — cùng layout chi tiết như TourDetailPage */}
      <div className="modal fade" ref={itineraryRef} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold mb-0">
                Lịch trình{itinerary.tour?.tieuDe ? ` — ${itinerary.tour.tieuDe}` : ''}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng" />
            </div>
            <div className="modal-body pt-2 pb-4">
              {itinerary.loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted">Đang lấy thông tin lịch trình...</p>
                </div>
              ) : itinerary.tour ? (
                <>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <h6 className="fw-bold mb-2">
                          <i className="bi bi-calendar-event text-success me-2" />
                          Khởi hành
                        </h6>
                        <p className="mb-0 text-muted small">
                          {formatDate(itinerary.tour.ngayKhoiHanh) || 'Chưa cập nhật'}
                        </p>
                        {itinerary.tour.ngayKetThuc && (
                          <p className="mb-0 text-muted small mt-1">
                            Kết thúc: {formatDate(itinerary.tour.ngayKetThuc)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <h6 className="fw-bold mb-2">
                          <i className="bi bi-geo-alt-fill text-danger me-2" />
                          Điểm đón
                        </h6>
                        <p className="mb-0 text-muted small">
                          {itinerary.tour.diemDons?.map((d) => d.ten).filter(Boolean).join(', ') || 'Chưa cập nhật'}
                        </p>
                        {itinerary.tour.diemDen?.ten && (
                          <p className="mb-0 text-muted small mt-1">Điểm đến: {itinerary.tour.diemDen.ten}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <h6 className="fw-bold mb-2">
                          <i className="bi bi-bus-front text-primary me-2" />
                          Phương tiện
                        </h6>
                        <p className="mb-0 text-muted small">
                          {itinerary.tour.phuongTien?.loai ?? itinerary.tour.phuongTien?.ten ?? 'Chưa cập nhật'}
                        </p>
                        {itinerary.tour.gia != null && (
                          <p className="mb-0 text-danger fw-bold small mt-1">{formatVnd(itinerary.tour.gia)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {itinerary.tour.highlight && (
                    <div className="alert alert-light border mb-4 small">
                      <i className="bi bi-stars text-warning me-2" />
                      {itinerary.tour.highlight}
                    </div>
                  )}
                  <TourItineraryTimeline
                    lichTrinhs={itinerary.tour.lichTrinhs ?? []}
                    tourImage={itinerary.tour.hinhAnh}
                  />
                </>
              ) : (
                <p className="text-muted text-center">Không tải được lịch trình.</p>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-dark rounded-pill px-4" data-bs-dismiss="modal">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <div className="modal fade" ref={reviewRef} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered review-modal-dialog">
          <div className="modal-content border-0 rounded-4 shadow-lg review-modal-content">
            <div className="review-modal-header">
              <div className="review-header-deco" />
              <div className="d-flex align-items-center gap-3 position-relative">
                <div className="review-header-icon">
                  <i className="bi bi-star-fill" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-white">Đánh giá chuyến đi</h5>
                  <p className="mb-0 text-white opacity-75 small">Chia sẻ cảm nhận của bạn</p>
                </div>
              </div>
              <button type="button" className="review-close-btn" data-bs-dismiss="modal" aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            {review && (
              <form onSubmit={submitReview}>
                <div className="modal-body p-4">
                  <div className="review-tour-chip mb-4">
                    <i className="bi bi-geo-alt-fill me-2" />
                    {review.tourTitle}
                  </div>
                  <div className="mb-4 text-center">
                    <p className="small fw-semibold text-muted mb-3">Mức độ hài lòng của bạn</p>
                    <div className="star-rating-wrap">
                      <div className="star-rating-group d-flex justify-content-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={`btn btn-link p-0 star-label${v <= review.diem ? ' lit selected' : ''}`}
                            onClick={() => setReview({ ...review, diem: v })}
                          >
                            <i className="bi bi-star-fill star-icon text-warning fs-3" />
                          </button>
                        ))}
                      </div>
                      <div className={`star-rating-label ${starInfo.cls} mt-2`}>
                        <span className="star-emoji">{starInfo.emoji}</span>
                        <span className="star-text">{starInfo.text}</span>
                        <span className="star-score">{review.diem}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Bình luận của bạn</label>
                    <textarea
                      className="form-control review-textarea rounded-3"
                      rows={4}
                      required
                      placeholder="Chia sẻ trải nghiệm thực tế của bạn về tour này..."
                      value={review.noiDung}
                      onChange={(e) => setReview({ ...review, noiDung: e.target.value })}
                    />
                  </div>
                  {review.error && <div className="alert alert-danger py-2">{review.error}</div>}
                  {review.success && <div className="alert alert-success py-2">{review.success}</div>}
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn review-cancel-btn rounded-pill px-4" data-bs-dismiss="modal">
                    Hủy
                  </button>
                  <button type="submit" className="btn review-submit-btn rounded-pill px-5" disabled={review.submitting}>
                    <i className="bi bi-send-fill me-2" />
                    {review.submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .user-bookings-page .booking-img-wrap { overflow: hidden; max-height: 200px; }
        .user-bookings-page .booking-thumb { width: 100%; min-height: 150px; object-fit: cover; transition: transform 0.4s ease; }
        .user-bookings-page .booking-card:hover .booking-thumb { transform: scale(1.05); }
        .user-bookings-page .booking-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 1.25rem 0 0.5rem; flex-wrap: wrap; }
        .user-bookings-page .pg-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 38px; padding: 0 10px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s ease; }
        .user-bookings-page .pg-btn:hover:not(.active):not(.disabled) { background: #f1f5f9; border-color: #667eea; color: #667eea; }
        .user-bookings-page .pg-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-color: transparent; }
        .user-bookings-page .pg-btn.disabled { opacity: 0.4; cursor: not-allowed; }
        .user-bookings-page .pg-info { font-size: 0.82rem; color: #94a3b8; font-weight: 500; padding: 0 4px; }
        .user-bookings-page .booking-item { animation: fadeInUp 0.35s ease both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .user-bookings-page .review-modal-dialog { max-width: 480px; }
        .user-bookings-page .review-modal-content { overflow: hidden; border-radius: 20px !important; }
        .user-bookings-page .review-modal-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; position: relative; }
        .user-bookings-page .review-header-deco { position: absolute; width: 150px; height: 150px; border-radius: 50%; background: rgba(255,255,255,0.08); right: -40px; top: -60px; }
        .user-bookings-page .review-header-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: #fff; }
        .user-bookings-page .review-close-btn { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 36px; height: 36px; border-radius: 10px; }
        .user-bookings-page .review-tour-chip { background: #f1f5f9; border-radius: 12px; padding: 0.75rem 1rem; font-weight: 600; }
        .user-bookings-page .star-rating-label { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; border: 1px solid #e2e8f0; }
        .user-bookings-page .review-cancel-btn { background: #f1f5f9; color: #475569; border: none; font-weight: 600; }
        .user-bookings-page .review-submit-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; font-weight: 700; }
        .user-bookings-page .star-label.lit .star-icon { color: #fbbf24 !important; }
      `}</style>
    </div>
  )
}
