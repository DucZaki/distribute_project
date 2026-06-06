import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActivePromos } from "../api/promos";
import { getFeaturedTours } from "../api/tours";
import { formatTourCode } from "../utils/tourCode";
import { formatVnd, imageUrl } from "../utils/format";

function promoBadge(promo) {
  if (promo.loai === "PERCENT") return `Giảm ${promo.giaTri}%`;
  return `Giảm ${formatVnd(promo.giaTri)}`;
}

function PromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [hotTours, setHotTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActivePromos().then((r) => setPromos(r.data ?? [])).catch(() => setPromos([])),
      getFeaturedTours(6).then((r) => setHotTours(r.data ?? [])).catch(() => setHotTours([])),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="promo-page">
      <section className="promo-hero py-5">
        <div className="container py-4">
          <span className="promo-hero-badge">
            <i className="bi bi-fire me-1" />
            Combo Hot
          </span>
          <h1 className="display-5 fw-bold text-white mb-3">Khuyến mãi &amp; ưu đãi tour</h1>
          <p className="lead text-white-50 mb-0 max-w-600">
            Săn deal giá tốt, áp mã giảm giá khi đặt tour — tiết kiệm thêm cho chuyến đi mơ ước của bạn.
          </p>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="fw-bold mb-4">
          <i className="bi bi-ticket-perforated-fill text-danger me-2" />
          Mã giảm giá đang hiệu lực
        </h2>

        {loading && (
          <p className="text-muted">
            <span className="spinner-border spinner-border-sm me-2" />
            Đang tải ưu đãi...
          </p>
        )}

        {!loading && promos.length === 0 && (
          <div className="alert alert-light border rounded-4 p-4">
            <p className="mb-2 fw-semibold">Hiện chưa có mã công khai.</p>
            <p className="mb-0 text-muted">Theo dõi bản tin hoặc liên hệ hotline để nhận ưu đãi riêng.</p>
          </div>
        )}

        <div className="row g-4">
          {promos.map((p) => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="promo-card h-100">
                <div className="promo-card-value">{promoBadge(p)}</div>
                <div className="promo-card-code">{p.ma}</div>
                <p className="text-muted small mb-2">{p.moTa || "Áp dụng khi đặt tour trên ZakiBooking"}</p>
                {p.ngayKetThuc && (
                  <p className="small mb-3">
                    <i className="bi bi-clock me-1" />
                    Hết hạn: {new Date(p.ngayKetThuc).toLocaleDateString("vi-VN")}
                  </p>
                )}
                <Link to="/tour" className="btn btn-outline-danger btn-sm rounded-pill fw-bold">
                  Chọn tour ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">Tour combo nổi bật</h2>
              <p className="text-muted mb-0">Các chuyến đi được yêu thích nhất — đặt sớm để giữ chỗ tốt nhất</p>
            </div>
            <Link to="/tour?sort=priceAsc" className="btn btn-link text-danger fw-bold">
              Xem tour giá tốt <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="row g-4">
            {hotTours.map((t) => (
              <div key={t.id} className="col-md-6 col-lg-4">
                <Link to={`/tour/${t.id}`} className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 promo-tour-card overflow-hidden">
                    <div className="position-relative">
                      <img src={imageUrl(t.hinhAnh ?? t.diemDen?.hinhAnh)} alt={t.tieuDe} className="card-img-top promo-tour-img" />
                      <span className="badge bg-danger position-absolute top-0 start-0 m-3">HOT</span>
                    </div>
                    <div className="card-body">
                      <h5 className="fw-bold text-dark">{t.tieuDe}</h5>
                      <p className="small text-muted mb-1">Mã: {formatTourCode(t.id)}</p>
                      <p className="text-danger fw-bold fs-5 mb-0">{formatVnd(t.gia)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Cần tư vấn combo riêng?</h3>
        <p className="text-muted mb-4">Đội ngũ ZakiBooking sẽ gợi ý tour phù hợp ngân sách và lịch trình của bạn.</p>
        <Link to="/contact" className="btn btn-danger btn-lg rounded-pill px-5 fw-bold">
          <i className="bi bi-telephone-fill me-2" />
          Đăng ký tư vấn miễn phí
        </Link>
      </section>
    </div>
  );
}

export { PromotionsPage };
