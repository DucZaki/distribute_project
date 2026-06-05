import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminTours, type TourSummary } from '../../api/adminTours'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { formatVnd, imageUrl } from '../../utils/format'

type Props = {
  status: 'active' | 'completed'
  title: string
}

export function AdminToursListPage({ status, title }: Props) {
  const [tours, setTours] = useState<TourSummary[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadErr, setLoadErr] = useState('')

  function load(p = 0) {
    setLoadErr('')
    listAdminTours(status, p, 12)
      .then((r) => {
        setTours(r.data.content ?? [])
        setPage(r.data.page ?? p)
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch((err: unknown) => {
        setTours([])
        setLoadErr(err instanceof Error ? err.message : 'Không tải được danh sách tour')
      })
  }

  useEffect(() => {
    load(0)
  }, [status])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="mb-0 fw-bold">{title}</h3>
        {status === 'active' && (
          <Link to="/admin/tour/create" className="btn btn-dark">
            <i className="bi bi-plus-circle me-1" /> Tạo chuyến đi mới
          </Link>
        )}
      </div>

      {loadErr && <div className="alert alert-warning py-2">{loadErr}</div>}

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4">
        {tours.map((t) => (
          <div className="col" key={t.id}>
            <div className="card h-100 border-0 shadow-sm tour-card">
              <Link
                to={`/admin/tour/detail/${t.id}?source=${status}`}
                className="text-decoration-none text-dark"
                onClick={() => sessionStorage.removeItem('tourTab')}
              >
                <img
                  src={imageUrl(t.hinhAnh)}
                  className="card-img-top"
                  style={{ height: 230, objectFit: 'cover' }}
                  alt={t.tieuDe}
                />
                <div className="card-body text-center pb-2">
                  <h6 className="fw-bold mb-2">{t.tieuDe}</h6>
                  <p className="text-danger fw-bold mb-0">{formatVnd(Number(t.gia ?? 0))}</p>
                </div>
              </Link>
              {status === 'completed' && (
                <div className="card-body pt-0 text-center">
                  <Link to={`/admin/tour/extend/${t.id}`} className="btn btn-sm btn-outline-primary">
                    Gia hạn
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {tours.length === 0 && (
          <div className="col-12 text-center text-muted py-4">Không có chuyến đi nào.</div>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} onPage={load} />
    </div>
  )
}
