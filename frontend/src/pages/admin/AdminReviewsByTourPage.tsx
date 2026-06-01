import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteReview, listReviews, type Review } from '../../api/adminReviews'
import { getAdminTour } from '../../api/adminTours'

export function AdminReviewsByTourPage() {
  const { tourId } = useParams()
  const tid = Number(tourId)
  const [title, setTitle] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!tid) return
    getAdminTour(tid).then((r) => setTitle(r.data.tieuDe ?? '')).catch(() => {})
    listReviews(0, 200, tid).then((r) => setReviews(r.data.content ?? [])).catch(() => setReviews([]))
  }, [tid])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">Đánh giá: {title || `Tour #${tid}`}</h2>
        <Link to="/admin/danh-gia" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="card border-0 shadow-sm mb-3 p-3">
          <div className="d-flex justify-content-between">
            <div>
              <div className="text-warning">{'★'.repeat(r.diem)}</div>
              <div className="small text-muted">User #{r.idNguoiDung} · {r.createdAt ? String(r.createdAt).slice(0, 10) : ''}</div>
              <p className="mb-0 mt-2">{r.noiDung}</p>
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r.id).then(() => setReviews((x) => x.filter((i) => i.id !== r.id)))}>
              Xóa
            </button>
          </div>
        </div>
      ))}
      {reviews.length === 0 && <p className="text-muted">Chưa có đánh giá cho tour này.</p>}
    </div>
  )
}
