import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchTours } from '../api/tours'
import type { TourSummary } from '../types/api'
import { formatTourCode } from '../utils/tourCode'
import { formatVnd, imageUrl } from '../utils/format'

const DEST_OPTIONS = [
  'Sapa', 'Hạ Long', 'Đà Nẵng', 'Huế', 'Phú Quốc', 'Cần Thơ',
  'Thái Lan', 'Singapore', 'Hàn Quốc', 'Pháp', 'Đức', 'Mỹ', 'Canada',
]

export function ToursPage() {
  const [params, setParams] = useSearchParams()
  const diemDen = params.get('diemDen') ?? params.get('thanhPho') ?? params.get('quocGia') ?? ''
  const ngayDi = params.get('ngayDi') ?? ''
  const khoangGia = params.get('khoangGia') ?? ''
  const sort = params.get('sort') ?? ''
  const page = Number(params.get('page') ?? '0')

  const [tours, setTours] = useState<TourSummary[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    searchTours({
      diemDen: diemDen || undefined,
      thanhPho: params.get('thanhPho') ?? undefined,
      quocGia: params.get('quocGia') ?? undefined,
      ngayDi: ngayDi || undefined,
      khoangGia: khoangGia || undefined,
      sort: sort || undefined,
      page,
    })
      .then((r) => {
        setTours(r.data.content ?? [])
        setTotal(r.data.totalElements ?? 0)
        setTotalPages(r.data.totalPages || 1)
      })
      .catch(() => setTours([]))
      .finally(() => setLoading(false))
  }, [params, diemDen, ngayDi, khoangGia, sort, page])

  function applyFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next = new URLSearchParams()
    ;['diemDen', 'ngayDi', 'khoangGia'].forEach((k) => {
      const v = String(fd.get(k) ?? '')
      if (v) next.set(k, v)
    })
    if (sort) next.set('sort', sort)
    setParams(next)
  }

  function goPage(p: number) {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  return (
    <>
      <section className="container mt-5 pt-4 bg-white tour-list-heading">
        <h2 className="fw-bold mb-2 text-black">Danh sách Điểm Đến</h2>
        <p className="text-muted mb-0 d-md-none">Lọc nhanh, chọn tour phù hợp và đặt chỉ trong vài bước.</p>
      </section>

      <div className="container mb-5 bg-light">
        <section className="bg-light py-5">
          <div className="container">
            <div className="mobile-filter-shell d-md-none mb-3">
              <button
                className="btn btn-primary w-100 fw-bold mobile-filter-toggle"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#tourFilters"
                aria-expanded="false"
                aria-controls="tourFilters"
              >
                <i className="bi bi-sliders me-2" />
                Lọc tour phù hợp
              </button>
            </div>

            <div className="row align-items-start">
              <div
                className="col-md-3 border-end bg-white p-4 rounded shadow-sm filters-panel collapse d-md-block"
                id="tourFilters"
              >
                <h6 className="fw-bold mb-3">BỘ LỌC TÌM KIẾM</h6>
                <form onSubmit={applyFilter}>
                  <div className="mb-3">
                    <label className="form-label">Điểm đến</label>
                    <select className="form-select select-premium" name="diemDen" defaultValue={diemDen}>
                      <option value="">-- Tất cả điểm đến --</option>
                      {DEST_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày đi (từ)</label>
                    <input
                      className="form-control zaki-date"
                      name="ngayDi"
                      defaultValue={ngayDi}
                      placeholder="dd/mm/yyyy"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Khoảng giá</label>
                    <select className="form-select select-premium" name="khoangGia" defaultValue={khoangGia}>
                      <option value="">-- Tất cả --</option>
                      <option value="DUOI5">Dưới 5 triệu</option>
                      <option value="5_10">5 - 10 triệu</option>
                      <option value="TREN10">Trên 10 triệu</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-warning fw-bold w-100">
                    Áp dụng
                  </button>
                </form>
              </div>

              <div className="col-md-9">
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center mb-3">
                  <p className="mb-0">
                    Tìm thấy <strong>{loading ? '…' : total}</strong> tour phù hợp
                  </p>
                  <select
                    className="form-select w-100 w-md-auto select-premium"
                    value={sort}
                    onChange={(e) => {
                      const next = new URLSearchParams(params)
                      if (e.target.value) next.set('sort', e.target.value)
                      else next.delete('sort')
                      setParams(next)
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="priceAsc">Giá tăng dần</option>
                    <option value="priceDesc">Giá giảm dần</option>
                  </select>
                </div>

                {loading && (
                  <p className="text-muted">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang tải tour...
                  </p>
                )}

                {!loading && tours.length === 0 && (
                  <div className="alert alert-info text-center p-5 rounded shadow-sm">
                    <h5 className="fw-bold mb-2">Tạm thời không có chuyến đi nào tồn tại</h5>
                    <p className="mb-0 text-muted">Vui lòng thử lại với điểm đến hoặc khoảng giá khác</p>
                  </div>
                )}

                {!loading &&
                  tours.map((ds) => (
                    <div
                      key={ds.id}
                      className="d-flex border rounded mb-3 shadow-sm tour-list-card overflow-hidden position-relative"
                    >
                      <div className="tour-list-card-media flex-shrink-0">
                        <img
                          src={imageUrl(ds.hinhAnh ?? ds.diemDen?.hinhAnh)}
                          className="tour-list-card-img"
                          alt={ds.tieuDe}
                        />
                        {ds.noiBat && (
                          <span className="badge bg-danger tour-list-hot-badge">
                            <i className="bi bi-fire me-1" />
                            HOT TOUR
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex-grow-1 tour-list-card-info min-w-0">
                        <h5 className="fw-bold mb-2 tour-list-card-title">
                          <Link to={`/tour/${ds.id}`} className="text-decoration-none">
                            {ds.tieuDe}
                          </Link>
                        </h5>

                        <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-2 tour-list-card-stats">
                          <span className="text-warning fw-bold">
                            <i className="bi bi-star-fill me-1" />
                            <span>{(ds.averageRating ?? 0).toFixed(1)}</span>
                            <span className="text-muted fw-normal">({ds.ratingCount ?? 0})</span>
                          </span>
                          <span className="text-muted d-none d-sm-inline">|</span>
                          <span className="text-secondary fw-semibold">
                            <i className="bi bi-people-fill me-1 text-primary" />
                            <span>{(ds.bookingCount ?? 0) + '+ đã đặt'}</span>
                          </span>
                        </div>

                        <p className="mb-1 text-muted">
                          Mã tour: <strong className="text-body">{formatTourCode(ds.id)}</strong>
                        </p>
                        <p className="mb-2 text-muted">
                          Phương tiện: <span>{ds.phuongTien?.loai ?? '—'}</span>
                          <span className="mx-1">|</span>
                          Khởi hành: <span>{ds.diemDon?.ten ?? '—'}</span>
                        </p>
                        <p className="text-danger fw-bold fs-5 mb-0">{formatVnd(ds.gia)}</p>
                      </div>
                      <div className="d-flex align-items-center px-3 tour-list-card-action flex-shrink-0">
                        <Link to={`/tour/${ds.id}`} className="btn btn-primary fw-bold px-4">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}

                {totalPages > 1 && (
                  <ul className="pagination zaki-pagination justify-content-center mt-4">
                    <li className={`page-item${page <= 0 ? ' disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => goPage(page - 1)}>
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item${i === page ? ' active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => goPage(i)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${page >= totalPages - 1 ? ' disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => goPage(page + 1)}>
                        &raquo;
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
