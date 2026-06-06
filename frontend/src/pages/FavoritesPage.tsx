import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listFavorites, removeFavorite } from '../api/favorites'
import { getTour } from '../api/tours'
import { UserSidebar } from '../components/UserSidebar'
import { formatVnd, imageUrl } from '../utils/format'

type FavoriteItem = {
  tourId: number
  addedAt?: string
  tour?: {
    tieuDe?: string
    gia?: number
    hinhAnh?: string
  }
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('vi-VN')
}

export function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  function reload() {
    setLoading(true)
    listFavorites()
      .then(async (r) => {
        const favs = r.data ?? []
        const loaded = await Promise.all(
          favs.map(async (f: { idChuyenDi: number; ngayThem?: string; createdAt?: string }) => {
            try {
              const t = await getTour(f.idChuyenDi)
              return {
                tourId: f.idChuyenDi,
                addedAt: f.ngayThem ?? f.createdAt,
                tour: t.data,
              }
            } catch {
              return { tourId: f.idChuyenDi, addedAt: f.ngayThem ?? f.createdAt }
            }
          }),
        )
        setItems(loaded)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleRemove(tourId: number) {
    if (!window.confirm('Xóa khỏi yêu thích?')) return
    await removeFavorite(tourId)
    reload()
  }

  return (
    <div className="container user-page-shell">
      <div className="mb-3">
        <Link to="/" className="text-decoration-none text-dark small fw-bold">
          <i className="bi bi-arrow-left me-1" />
          Quay lại
        </Link>
      </div>
      <div className="row">
        <UserSidebar active="favorites" showTierProgress={false} />
        <div className="col-lg-9">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-heart-fill text-danger fs-3 me-2" />
            <h3 className="fw-bold mb-0">Tour yêu thích của tôi</h3>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-5 shadow-sm rounded-4 bg-light border">
              <i className="bi bi-bag-heart fs-1 text-muted" />
              <p className="mt-3 text-muted">Bạn chưa có chuyến đi nào trong danh sách yêu thích.</p>
              <Link to="/tour" className="btn btn-primary rounded-pill px-4">
                Khám phá ngay
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="row g-4">
              {items.map(({ tourId, tour, addedAt }) => (
                <div key={tourId} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden favorite-card">
                    <div className="position-relative">
                      <img
                        src={imageUrl(tour?.hinhAnh)}
                        className="card-img-top"
                        alt={tour?.tieuDe ?? ''}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="position-absolute top-0 end-0 m-2 btn btn-white btn-sm rounded-circle shadow-sm text-danger"
                        onClick={() => handleRemove(tourId)}
                        aria-label="Xóa khỏi yêu thích"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                    <div className="card-body p-4">
                      <h5 className="fw-bold">{tour?.tieuDe ?? `Tour #${tourId}`}</h5>
                      <div className="text-muted small mb-3">
                        <i className="bi bi-calendar3 me-1" />
                        {formatDate(addedAt)}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-danger fw-bold">{formatVnd(tour?.gia)}</span>
                        <Link to={`/tour/${tourId}`} className="btn btn-outline-primary btn-sm rounded-pill">
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .favorite-card { transition: transform 0.3s ease; }
        .favorite-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .btn-white { background: white; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
        .btn-white:hover { background: #f8f9fa; color: #dc3545 !important; }
      `}</style>
    </div>
  )
}
