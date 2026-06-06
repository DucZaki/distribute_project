import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteReview, listReviews, type AdminReview } from '../../api/adminReviews'
import { AdminPagination } from '../../components/admin/AdminPagination'

function formatDate(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('vi-VN')
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="text-warning">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={`bi ${i < score ? 'bi-star-fill' : 'bi-star'}`} />
      ))}
    </div>
  )
}

export function AdminReviewsByTourPage() {
  const { tourId } = useParams()
  const tid = Number(tourId)
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hoTen, setHoTen] = useState('')
  const [diem, setDiem] = useState('')
  const [sort, setSort] = useState('')
  const [filters, setFilters] = useState({ hoTen: '', diem: '', sort: '' })

  function load(p = 0) {
    if (!tid) return
    listReviews({
      tourId: tid,
      page: p,
      size: 10,
      hoTen: filters.hoTen || undefined,
      diem: filters.diem ? Number(filters.diem) : undefined,
      sort: filters.sort || undefined,
    })
      .then((r) => {
        setReviews(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
        setPage(r.data.page ?? p)
      })
      .catch(() => setReviews([]))
  }

  useEffect(() => {
    load(0)
  }, [tid, filters])

  function onApply(e: FormEvent) {
    e.preventDefault()
    setFilters({ hoTen, diem, sort })
  }

  async function onDelete(id: number) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    await deleteReview(id)
    load(page)
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex align-items-center mb-4">
        <Link to="/admin/danh-gia" className="btn btn-outline-dark rounded-pill me-3">
          <i className="bi bi-arrow-left" /> Quay lại
        </Link>
        <h3 className="fw-bold mb-0">Chi tiết đánh giá</h3>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={onApply} autoComplete="off">
            <div className="col-md-4">
              <label className="form-label small fw-bold">Tìm theo tên người dùng</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên..."
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Lọc theo số sao</label>
              <select className="form-select" value={diem} onChange={(e) => setDiem(e.target.value)}>
                <option value="">-- Tất cả --</option>
                <option value="5">5 sao (Cực tốt)</option>
                <option value="4">4 sao (Tốt)</option>
                <option value="3">3 sao (Trung bình)</option>
                <option value="2">2 sao (Kém)</option>
                <option value="1">1 sao (Rất tệ)</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Sắp xếp</label>
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Mới nhất</option>
                <option value="scoreDesc">Số sao giảm dần</option>
                <option value="scoreAsc">Số sao tăng dần</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-outline-dark w-100 rounded-pill">
                Áp dụng
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Người dùng</th>
                <th>Chuyến đi</th>
                <th>Đánh giá</th>
                <th>Bình luận</th>
                <th>Ngày</th>
                <th className="text-center pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="ps-4">
                    <div className="fw-bold">{r.hoTen ?? `User #${r.idNguoiDung}`}</div>
                    {r.tenDangNhap && <small className="text-muted">{r.tenDangNhap}</small>}
                  </td>
                  <td>{r.tourTitle ?? `Tour #${r.idChuyenDi}`}</td>
                  <td>
                    <StarRating score={r.diem} />
                  </td>
                  <td className="text-wrap" style={{ maxWidth: 300 }}>
                    {r.noiDung}
                  </td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td className="text-center pe-4">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => onDelete(r.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    <i className="bi bi-chat-dots fs-1 mb-2 d-block" />
                    Không có đánh giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
