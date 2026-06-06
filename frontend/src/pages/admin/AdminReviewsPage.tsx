import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listToursWithReviews, type TourReviewSummary } from '../../api/adminReviews'
import { imageUrl } from '../../utils/format'

function formatRating(v: number) {
  return v.toFixed(1)
}

export function AdminReviewsPage() {
  const [sort, setSort] = useState('')
  const [tours, setTours] = useState<TourReviewSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listToursWithReviews(sort || undefined)
      .then((r) => setTours(r.data ?? []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false))
  }, [sort])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Quản lý đánh giá theo Tour</h3>
          <div className="text-muted small">Xem hiệu suất phản hồi của từng chuyến đi</div>
        </div>
        <div className="d-flex align-items-center">
          <label className="me-2 fw-bold small text-nowrap">Sắp xếp theo:</label>
          <select
            className="form-select form-select-sm rounded-pill px-3"
            style={{ width: 180 }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Mặc định</option>
            <option value="ratingDesc">Đánh giá cao nhất</option>
            <option value="ratingAsc">Đánh giá thấp nhất</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-muted py-5 text-center">Đang tải...</div>
      ) : tours.length === 0 ? (
        <div className="alert alert-info text-center p-5 rounded-4 shadow-sm">
          <i className="bi bi-info-circle fs-1 mb-3 d-block" />
          <h5 className="fw-bold">Chưa có đánh giá nào được gửi</h5>
          <p className="mb-0 text-muted">Hệ thống sẽ hiển thị các tour có bình luận tại đây.</p>
        </div>
      ) : (
        <div className="row g-4">
          {tours.map((tour) => (
            <div className="col-md-4" key={tour.tourId}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden tour-review-card">
                <img
                  src={imageUrl(tour.hinhAnh)}
                  className="card-img-top"
                  style={{ height: 180, objectFit: 'cover' }}
                  alt={tour.tieuDe ?? ''}
                />
                <div className="card-body">
                  <h5 className="fw-bold text-truncate">{tour.tieuDe ?? `Tour #${tour.tourId}`}</h5>
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-auto">
                      <span className="fs-4 fw-bold text-warning">{formatRating(tour.avgRating)}</span>
                      <span className="text-muted"> / 5.0</span>
                    </div>
                    <div className="badge bg-light text-dark rounded-pill px-3 py-2">
                      <i className="bi bi-chat-right-text me-1 text-primary" />
                      {tour.totalReviews} đánh giá
                    </div>
                  </div>
                  <div className="small mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Tích cực (4-5 sao)</span>
                      <span>{tour.positivePercentage}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${tour.positivePercentage}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/admin/danh-gia/tour/${tour.tourId}`}
                    className="btn btn-outline-dark w-100 rounded-pill mt-3"
                  >
                    Xem chi tiết bình luận <i className="bi bi-arrow-right ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .tour-review-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .tour-review-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .tour-review-card .progress-bar { border-radius: 10px; }
      `}</style>
    </div>
  )
}
