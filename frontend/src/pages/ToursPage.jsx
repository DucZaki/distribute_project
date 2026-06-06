import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchTours } from "../api/tours";
import { TOUR_CATEGORIES } from "../constants/navConfig";
import { formatTourCode } from "../utils/tourCode";
import { TourCardStats } from "../components/TourCardStats";
import { formatVnd, imageUrl, transportLabel } from "../utils/format";

function ToursPage() {
  const [params, setParams] = useSearchParams();
  const diemDen = params.get("diemDen") ?? params.get("thanhPho") ?? params.get("quocGia") ?? "";
  const loai = params.get("loai") ?? "";
  const keyword = params.get("keyword") ?? "";
  const ngayDi = params.get("ngayDi") ?? "";
  const khoangGia = params.get("khoangGia") ?? "";
  const sort = params.get("sort") ?? "popular";
  const page = Number(params.get("page") ?? "0");
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loaiLabel = TOUR_CATEGORIES.find((c) => c.id === loai)?.label;

  useEffect(() => {
    setLoading(true);
    searchTours({
      diemDen: diemDen || undefined,
      thanhPho: params.get("thanhPho") ?? undefined,
      quocGia: params.get("quocGia") ?? undefined,
      loai: loai || undefined,
      keyword: keyword || undefined,
      ngayDi: ngayDi || undefined,
      khoangGia: khoangGia || undefined,
      sort: sort === "popular" ? undefined : sort,
      page,
    })
      .then((r) => {
        setTours(r.data.content ?? []);
        setTotal(r.data.totalElements ?? 0);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [params, diemDen, loai, keyword, ngayDi, khoangGia, sort, page]);

  function applyFilter(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    ["diemDen", "ngayDi", "khoangGia"].forEach((k) => {
      const v = String(fd.get(k) ?? "");
      if (v) next.set(k, v);
    });
    if (loai) next.set("loai", loai);
    if (keyword) next.set("keyword", keyword);
    if (sort) next.set("sort", sort);
    setParams(next);
  }

  function goPage(p) {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  }

  return (
    <>
      <section className="container mt-5 pt-4 tour-list-heading">
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Tour</li>
            {loaiLabel && <li className="breadcrumb-item active">{loaiLabel}</li>}
            {diemDen && !loaiLabel && <li className="breadcrumb-item active">{diemDen}</li>}
          </ol>
        </nav>
        <h2 className="fw-bold mb-2 text-black">
          {loaiLabel ? loaiLabel : diemDen ? `Tour ${diemDen}` : "Danh sách tour"}
        </h2>
        <p className="text-muted mb-0 d-md-none">Lọc nhanh, chọn tour phù hợp và đặt chỉ trong vài bước.</p>
      </section>

      <div className="container mb-5 bg-light">
        <section className="bg-light py-5">
          <div className="container">
            {loai && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {TOUR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/tour?loai=${cat.id}${cat.keyword ? `&keyword=${encodeURIComponent(cat.keyword)}` : ""}`}
                    className={`btn btn-sm rounded-pill ${loai === cat.id ? "btn-primary" : "btn-outline-secondary"}`}
                  >
                    <i className={`bi ${cat.icon} me-1`} />
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}

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
              <div className="col-md-3 border-end bg-white p-4 rounded shadow-sm filters-panel collapse d-md-block" id="tourFilters">
                <h6 className="fw-bold mb-3">BỘ LỌC TÌM KIẾM</h6>
                <form onSubmit={applyFilter}>
                  <div className="mb-3">
                    <label className="form-label">Điểm đến</label>
                    <input className="form-control" name="diemDen" defaultValue={diemDen} placeholder="VD: Hà Nội, Tokyo..." />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày đi (từ)</label>
                    <input className="form-control zaki-date" name="ngayDi" defaultValue={ngayDi} placeholder="dd/mm/yyyy" inputMode="numeric" />
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
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center mb-3">
                  <p className="mb-0">
                    Tìm thấy <strong>{loading ? "…" : total}</strong> tour phù hợp
                  </p>
                  <select
                    className="form-select w-100 w-md-auto select-premium"
                    value={sort}
                    onChange={(e) => {
                      const next = new URLSearchParams(params);
                      if (e.target.value) next.set("sort", e.target.value);
                      else next.delete("sort");
                      setParams(next);
                    }}
                  >
                    <option value="popular">Nổi bật → nhiều lượt đặt → đánh giá cao</option>
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
                    <div key={ds.id} className="d-flex border rounded mb-3 shadow-sm tour-list-card overflow-hidden position-relative">
                      <div className="tour-list-card-media flex-shrink-0">
                        <img src={imageUrl(ds.hinhAnh ?? ds.diemDen?.hinhAnh)} className="tour-list-card-img" alt={ds.tieuDe} />
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
                        <TourCardStats averageRating={ds.averageRating} ratingCount={ds.ratingCount} bookingCount={ds.bookingCount} />
                        <p className="mb-1 text-muted">
                          Mã tour: <strong className="text-body">{formatTourCode(ds.id)}</strong>
                        </p>
                        <p className="mb-2 text-muted">
                          Phương tiện: <span>{transportLabel(ds.phuongTien?.loai ?? ds.phuongTien?.ten)}</span>
                          <span className="mx-1">|</span>
                          Khởi hành: <span>{ds.diemDon?.ten ?? "—"}</span>
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
                    <li className={`page-item${page <= 0 ? " disabled" : ""}`}>
                      <button type="button" className="page-link" onClick={() => goPage(page - 1)}>
                        «
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item${i === page ? " active" : ""}`}>
                        <button type="button" className="page-link" onClick={() => goPage(i)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${page >= totalPages - 1 ? " disabled" : ""}`}>
                      <button type="button" className="page-link" onClick={() => goPage(page + 1)}>
                        »
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
  );
}

export { ToursPage };
