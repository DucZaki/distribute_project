import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { addFavorite, listFavorites, removeFavorite } from '../api/favorites'
import { getReviewSummary, getTourReviews } from '../api/reviews'
import { getTour } from '../api/tours'
import { useAuth } from '../auth/AuthContext'
import type { ReviewItem, TourDetail } from '../types/api'
import { formatTourCode } from '../utils/tourCode'
import { formatVnd, imageUrl } from '../utils/format'

export function TourDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const tourId = Number(id)

  const [tour, setTour] = useState<TourDetail | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [summary, setSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null)
  const [favorited, setFavorited] = useState(false)
  const selectedScheduleId = Number(searchParams.get('nkhId') || searchParams.get('scheduleId') || 0)

  useEffect(() => {
    if (!tourId) return
    getTour(tourId).then((r) => setTour(r.data)).catch(() => setTour(null))
    getTourReviews(tourId).then((r) => setReviews(r.data.content ?? [])).catch(() => {})
    getReviewSummary(tourId).then((r) => setSummary(r.data)).catch(() => {})
    if (isAuthenticated) {
      listFavorites().then((r) => setFavorited(!!r.data?.some((f) => f.idChuyenDi === tourId))).catch(() => {})
    }
  }, [tourId, isAuthenticated])

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

  if (!tour) {
    return (
      <div className="container pt-5 tour-detail-container">
        <p className="text-muted">Đang tải hoặc không tìm thấy tour...</p>
      </div>
    )
  }

  const selectedSchedule = tour.ngayKhoiHanhs?.find((s) => s.id === selectedScheduleId)

  return (
    <div className="container pt-5 tour-detail-container">
      <div className="row" style={{ marginTop: 30 }}>
        <div className="col-lg-8">
          <h1 className="h4 fw-bold">{tour.tieuDe}</h1>
          <p className="text-muted small">Mã: {formatTourCode(tour.id)} · {tour.diemDen?.ten}</p>
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

          {tour.highlight && <p className="fw-semibold text-primary">{tour.highlight}</p>}
          <p className="text-muted">{tour.moTa}</p>

          <div className="card-header bg-white border-0 ps-0 mt-4">
            <h2 className="h5 fw-bold">LỊCH KHỞI HÀNH</h2>
          </div>
          <div className="list-group mb-4">
            {tour.ngayKhoiHanhs?.map((s) => (
              <Link
                key={s.id}
                to={`/tour/${tour.id}?nkhId=${s.id}`}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${selectedScheduleId === s.id ? ' active' : ''}`}
              >
                <span>{s.ngayKhoiHanh}</span>
                <span className="badge bg-primary">{s.availableSeats} chỗ còn</span>
              </Link>
            ))}
            {!tour.ngayKhoiHanhs?.length && <div className="alert alert-light">Chưa có lịch khởi hành.</div>}
          </div>

          {!!tour.lichTrinhs?.length && (
            <>
              <h2 className="h5 fw-bold">LỊCH TRÌNH</h2>
              <div className="accordion mb-4" id="itineraryAcc">
                {tour.lichTrinhs.map((i) => (
                  <div key={i.ngayThu} className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#day-${i.ngayThu}`}>
                        Ngày {i.ngayThu}: {i.tieuDe}
                      </button>
                    </h2>
                    <div id={`day-${i.ngayThu}`} className="accordion-collapse collapse" data-bs-parent="#itineraryAcc">
                      <div className="accordion-body">{i.moTa}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="h5 fw-bold">ĐÁNH GIÁ {summary ? `(${summary.averageRating?.toFixed(1)}★ · ${summary.totalReviews})` : ''}</h2>
          {reviews.map((r) => (
            <div key={r.id} className="border rounded p-3 mb-2">
              <div className="text-warning">{'★'.repeat(r.diem)}{'☆'.repeat(5 - r.diem)}</div>
              <p className="mb-0">{r.noiDung}</p>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow sticky-top" style={{ top: 100 }}>
            <div className="card-body">
              <p className="text-muted small mb-1">Giá từ</p>
              <p className="fs-3 fw-bold text-danger mb-3">{formatVnd(tour.gia)}</p>
              {selectedSchedule && (
                <p className="small text-muted">Ngày đã chọn: <strong>{selectedSchedule.ngayKhoiHanh}</strong></p>
              )}
              <button
                type="button"
                className={`btn w-100 mb-2 ${favorited ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={toggleFavorite}
              >
                <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'}`} /> Yêu thích
              </button>
              <button
                type="button"
                className="btn btn-primary w-100 fw-bold py-3"
                disabled={!selectedScheduleId}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: `/tour/${tour.id}/dat-tour?nkhId=${selectedScheduleId}` } })
                    return
                  }
                  navigate(`/tour/${tour.id}/dat-tour?nkhId=${selectedScheduleId}`)
                }}
              >
                {selectedScheduleId ? 'ĐẶT NGAY' : 'Chọn ngày khởi hành'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
