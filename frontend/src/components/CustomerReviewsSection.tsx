import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllReviews } from '../api/reviews'
import type { ReviewItem } from '../types/api'

function stars(diem = 0) {
  const n = Math.min(5, Math.max(0, diem))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatReviewDate(createdAt?: string) {
  if (!createdAt) return '—'
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return String(createdAt).slice(0, 10)
  return d.toLocaleDateString('vi-VN')
}

function ReviewSlide({ review }: { review: ReviewItem }) {
  const title = review.tourTitle ?? `Tour #${review.idChuyenDi}`
  return (
    <Link to={`/tour/${review.idChuyenDi}`} className="text-decoration-none">
      <blockquote className="blockquote" style={{ background: 'none', color: '#000' }}>
        <p className="mb-2 fw-bolder" style={{ marginBottom: 0 }}>
          {title}:
        </p>
        <div className="text-warning small mb-2">{stars(review.diem)}</div>
        <p className="mb-4" style={{ marginBottom: 0 }}>
          {review.noiDung}
        </p>
        <footer className="blockquote-footer">
          {review.hoTen ?? `Khách hàng #${review.idNguoiDung}`}
          {review.createdAt && (
            <span className="text-muted ms-2">· {formatReviewDate(review.createdAt)}</span>
          )}
        </footer>
      </blockquote>
    </Link>
  )
}

export function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAllReviews()
      .then((list) => {
        if (!cancelled) setReviews(list)
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section className="py-5 text-center home-section-reviews">
        <div className="container">
          <div className="text-center mb-4 mx-auto" style={{ maxWidth: '680px' }}>
            <span className="text-primary fw-bold text-uppercase ls-wide mb-2 d-inline-block">Đánh giá</span>
            <h2 className="fw-800 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              Khách hàng nói gì?
            </h2>
            <p className="text-muted mb-0">Những chia sẻ và cảm nhận thực tế từ hành khách sau mỗi chuyến đi</p>
          </div>
          <div className="text-muted py-4">
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Đang tải bình luận...
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="py-5 text-center home-section-reviews">
      <div className="container">
        <div className="text-center mb-5 mx-auto" style={{ maxWidth: '680px' }}>
          <span className="text-primary fw-bold text-uppercase ls-wide mb-2 d-inline-block">Đánh giá</span>
          <h2 className="fw-800 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            Khách hàng nói gì?
          </h2>
          <p className="text-muted mb-0">Những chia sẻ và cảm nhận thực tế từ hành khách sau mỗi chuyến đi</p>
        </div>

        <div
          id="reviewCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval={5000}
          style={{ background: 'none' }}
        >
          <div className="carousel-inner" style={{ background: 'none' }}>
            {reviews.map((r, i) => (
              <div key={r.id} className={`carousel-item${i === 0 ? ' active' : ''}`}>
                <ReviewSlide review={r} />
              </div>
            ))}
          </div>
          {reviews.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#reviewCarousel"
                data-bs-slide="prev"
                style={{ background: 'transparent', border: 'none', width: '8%' }}
              >
                <span className="text-dark fs-1" aria-hidden="true">
                  ‹
                </span>
                <span className="visually-hidden">Trước</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#reviewCarousel"
                data-bs-slide="next"
                style={{ background: 'transparent', border: 'none', width: '8%' }}
              >
                <span className="text-dark fs-1" aria-hidden="true">
                  ›
                </span>
                <span className="visually-hidden">Tiếp</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
