import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteReview, listReviews, type Review } from '../../api/adminReviews'
import { listAdminTours } from '../../api/adminTours'

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [tourTitles, setTourTitles] = useState<Record<number, string>>({})

  useEffect(() => {
    listReviews(0, 200).then((r) => setReviews(r.data.content ?? [])).catch(() => setReviews([]))
    Promise.all([
      listAdminTours('active', 0, 100),
      listAdminTours('completed', 0, 100),
    ]).then(([a, c]) => {
      const m: Record<number, string> = {}
      ;[...(a.data.content ?? []), ...(c.data.content ?? [])].forEach((t) => {
        if (t.id) m[t.id] = t.tieuDe ?? `Tour #${t.id}`
      })
      setTourTitles(m)
    }).catch(() => {})
  }, [])

  const byTour = useMemo(() => {
    const map = new Map<number, Review[]>()
    reviews.forEach((r) => {
      const list = map.get(r.idChuyenDi) ?? []
      list.push(r)
      map.set(r.idChuyenDi, list)
    })
    return Array.from(map.entries()).map(([tourId, list]) => ({
      tourId,
      title: tourTitles[tourId] ?? `Tour #${tourId}`,
      count: list.length,
      avg: list.reduce((s, x) => s + x.diem, 0) / list.length,
    }))
  }, [reviews, tourTitles])

  return (
    <div className="container-fluid px-0">
      <h2 className="fw-bold mb-4">Quản lý đánh giá</h2>
      <div className="row g-3 mb-4">
        {byTour.map((t) => (
          <div className="col-md-4" key={t.tourId}>
            <Link to={`/admin/danh-gia/tour/${t.tourId}`} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold">{t.title}</h6>
                  <div className="text-warning">{'★'.repeat(Math.round(t.avg))}</div>
                  <div className="text-muted small">{t.count} đánh giá</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {byTour.length === 0 && <div className="text-muted">Chưa có đánh giá.</div>}
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white fw-bold">Tất cả đánh giá</div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="bg-light">
              <tr><th className="px-4">Tour</th><th>User</th><th>Điểm</th><th>Nội dung</th><th></th></tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-4">{tourTitles[r.idChuyenDi] ?? `#${r.idChuyenDi}`}</td>
                  <td>#{r.idNguoiDung}</td>
                  <td>{'★'.repeat(r.diem)}</td>
                  <td className="small">{r.noiDung?.slice(0, 80)}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r.id).then(() => setReviews((x) => x.filter((i) => i.id !== r.id)))}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
