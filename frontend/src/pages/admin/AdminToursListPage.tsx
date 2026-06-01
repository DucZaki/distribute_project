import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminTours } from '../../api/adminTours'
import { AdminPagination } from '../../components/admin/AdminPagination'
import type { TourSummary } from '../../types/api'
import { formatVnd } from '../../utils/format'

type Props = { status: 'active' | 'completed'; title: string }

export function AdminToursListPage({ status, title }: Props) {
  const [tours, setTours] = useState<TourSummary[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  function load(p = 0) {
    listAdminTours(status, p, 12).then((r) => {
      setTours(r.data.content ?? [])
      setTotalPages(r.data.totalPages ?? 0)
      setPage(r.data.page ?? p)
    }).catch(() => setTours([]))
  }

  useEffect(() => { load(0) }, [status])

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">{title}</h3>
        <Link to="/admin/tour/create" className="btn btn-dark">
          <i className="bi bi-plus-circle" /> Tạo chuyến đi mới
        </Link>
      </div>
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4">
        {tours.map((t) => (
          <div className="col" key={t.id}>
            <Link className="tour-card" to={`/admin/tour/detail/${t.id}?source=${status}`}>
              <div className="card h-100 border-0 shadow-sm tour-card">
                <img src={t.hinhAnh || '/anh/anh/diemden/hanoi.jpg'} className="card-img-top" style={{ height: 230, objectFit: 'cover' }} alt="" />
                <div className="card-body text-center">
                  <h6 className="fw-bold mb-2">{t.tieuDe}</h6>
                  <p className="text-danger fw-bold mb-0">{formatVnd(Number(t.gia ?? 0))}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {tours.length === 0 && <div className="col-12 text-center text-muted py-4">Không có chuyến đi nào.</div>}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
