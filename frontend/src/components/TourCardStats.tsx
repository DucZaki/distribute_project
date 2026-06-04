import { formatCountCap99 } from '../utils/format'

/** Sao + số khách đã đặt (từ API tour-service). */
export function TourCardStats({
  averageRating = 0,
  ratingCount = 0,
  bookingCount = 0,
}: {
  averageRating?: number
  ratingCount?: number
  bookingCount?: number
}) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-2 tour-list-card-stats">
      <span className="text-warning fw-bold">
        <i className="bi bi-star-fill me-1" />
        {Number(averageRating).toFixed(1)}
        <span className="text-muted fw-normal"> ({formatCountCap99(ratingCount)})</span>
      </span>
      <span className="text-muted d-none d-sm-inline">|</span>
      <span className="text-secondary fw-semibold">
        <i className="bi bi-people-fill me-1 text-primary" />
        {formatCountCap99(bookingCount)} đã đặt
      </span>
    </div>
  )
}
