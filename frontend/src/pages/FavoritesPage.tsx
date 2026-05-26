import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listFavorites, removeFavorite } from '../api/favorites'
import { getTour } from '../api/tours'
import { UserSidebar } from '../components/UserSidebar'
import type { TourSummary } from '../types/api'
import { formatVnd, imageUrl } from '../utils/format'

export function FavoritesPage() {
  const [items, setItems] = useState<{ tourId: number; tour?: TourSummary }[]>([])

  function reload() {
    listFavorites()
      .then(async (r) => {
        const favs = r.data ?? []
        const loaded = await Promise.all(
          favs.map(async (f) => {
            try {
              const t = await getTour(f.idChuyenDi)
              return { tourId: f.idChuyenDi, tour: t.data }
            } catch {
              return { tourId: f.idChuyenDi }
            }
          }),
        )
        setItems(loaded)
      })
      .catch(() => setItems([]))
  }

  useEffect(() => { reload() }, [])

  return (
    <div className="container my-5 pt-4">
      <div className="row">
        <UserSidebar active="favorites" />
        <div className="col-lg-9">
          <h3 className="fw-bold mb-4">Tour yêu thích</h3>
          {items.length === 0 && <div className="alert alert-light">Chưa có tour yêu thích.</div>}
          <div className="row g-3">
            {items.map(({ tourId, tour }) => (
              <div key={tourId} className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  {tour && <img src={imageUrl(tour.hinhAnh)} alt="" className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />}
                  <div className="card-body">
                    <h5 className="fw-bold">{tour?.tieuDe ?? `Tour #${tourId}`}</h5>
                    {tour && <p className="text-danger fw-bold">{formatVnd(tour.gia)}</p>}
                    <div className="d-flex gap-2">
                      <Link to={`/tour/${tourId}`} className="btn btn-primary btn-sm">Xem</Link>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeFavorite(tourId).then(reload)}>Bỏ thích</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
