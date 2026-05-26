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
  }, [params])

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

  return (
    <section className="container mt-5 pt-4 bg-white">
      <h2 className="fw-bold mb-4 text-black">Danh sách Điểm Đến</h2>
      <div className="container mb-5 bg-light">
        <div className="row align-items-start">
          <section className="bg-light py-5 w-100">
            <div className="container">
              <div className="row align-items-start">
                <div className="col-md-3 border-end bg-white p-4 rounded shadow-sm filters-panel">
                  <h6 className="fw-bold mb-3">BỘ LỌC TÌM KIẾM</h6>
                  <form onSubmit={applyFilter}>
                    <div className="mb-3">
                      <label className="form-label">Điểm đến</label>
                      <select className="form-select select-premium" name="diemDen" defaultValue={diemDen}>
                        <option value="">-- Tất cả điểm đến --</option>
                        {DEST_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ngày đi (từ)</label>
                      <input className="form-control zaki-date" name="ngayDi" defaultValue={ngayDi} placeholder="dd/mm/yyyy" />
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
                    <button type="submit" className="btn btn-warning fw-bold w-100">Áp dụng</button>
                  </form>
                </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="mb-0">Tìm thấy <strong>{total}</strong> tour phù hợp</p>
                    <select
                      className="form-select w-auto select-premium"
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
                  {loading && <p className="text-muted">Đang tải...</p>}
                  {!loading && tours.length === 0 && (
                    <div className="alert alert-info text-center p-5 rounded shadow-sm">
                      <h5 className="fw-bold mb-2">Tạm thời không có chuyến đi nào tồn tại</h5>
                      <p className="mb-0 text-muted">Vui lòng thử lại với điểm đến hoặc khoảng giá khác</p>
                    </div>
                  )}
                  {tours.map((ds) => (
                    <div key={ds.id} className="d-flex border rounded mb-3 shadow-sm bg-white flex-wrap">
                      <img src={imageUrl(ds.hinhAnh)} alt="" style={{ width: 260, height: 210, objectFit: 'cover' }} className="rounded" />
                      <div className="p-3 flex-grow-1">
                        <h5 className="fw-bold">{ds.tieuDe}</h5>
                        <p className="mb-1">Mã tour: <strong>{formatTourCode(ds.id)}</strong></p>
                        <p className="mb-1">{ds.diemDen?.ten ?? 'Tour du lịch'}</p>
                        <p className="text-danger fw-bold">{formatVnd(ds.gia)}</p>
                      </div>
                      <div className="d-flex align-items-center px-3 pb-3 pb-md-0">
                        <Link to={`/tour/${ds.id}`} className="btn btn-outline-primary">Xem chi tiết</Link>
                      </div>
                    </div>
                  ))}
                  {totalPages > 1 && (
                    <ul className="pagination zaki-pagination justify-content-center mt-4">
                      <li className={`page-item${page <= 0 ? ' disabled' : ''}`}>
                        <button type="button" className="page-link" onClick={() => { const n = new URLSearchParams(params); n.set('page', String(page - 1)); setParams(n) }}>&laquo;</button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i} className={`page-item${i === page ? ' active' : ''}`}>
                          <button type="button" className="page-link" onClick={() => { const n = new URLSearchParams(params); n.set('page', String(i)); setParams(n) }}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item${page >= totalPages - 1 ? ' disabled' : ''}`}>
                        <button type="button" className="page-link" onClick={() => { const n = new URLSearchParams(params); n.set('page', String(page + 1)); setParams(n) }}>&raquo;</button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
