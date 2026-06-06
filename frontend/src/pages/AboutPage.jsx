import { Link } from "react-router-dom";
import { HOTLINE, HOTLINE_TEL } from "../constants/navConfig";

const VALUES = [
  { icon: "bi-shield-check", title: "Uy tín & minh bạch", desc: "Thông tin tour rõ ràng, giá công khai, hỗ trợ trước – trong – sau chuyến đi." },
  { icon: "bi-stars", title: "Trải nghiệm được chọn lọc", desc: "Tour nội địa và quốc tế được thiết kế cân bằng giữa tham quan, nghỉ ngơi và khám phá." },
  { icon: "bi-headset", title: "Hỗ trợ tận tâm", desc: "Hotline và chatbot 24/7 giúp bạn giải đáp nhanh mọi thắc mắc về lịch trình, thanh toán." },
  { icon: "bi-credit-card-2-front", title: "Thanh toán an toàn", desc: "Tích hợp VNPay và quy trình xác nhận đặt chỗ minh bạch trên nền tảng microservices hiện đại." },
];

function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero py-5">
        <div className="container py-4">
          <span className="text-primary fw-bold text-uppercase ls-wide">Về chúng tôi</span>
          <h1 className="display-5 fw-bold mb-3">ZakiBooking — Kiến tạo hành trình đáng nhớ</h1>
          <p className="lead text-muted mb-0" style={{ maxWidth: 720 }}>
            Chúng tôi là nền tảng đặt tour du lịch thông minh, kết hợp công nghệ AI và dịch vụ tư vấn cá nhân hóa
            để giúp bạn lên kế hoạch, so sánh và đặt tour chỉ trong vài phút.
          </p>
        </div>
      </section>

      <section className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <img
              src="/anh/diemden/halong.jpg"
              alt="Du lịch Việt Nam"
              className="img-fluid rounded-4 shadow"
            />
          </div>
          <div className="col-lg-6">
            <h2 className="fw-bold mb-3">Câu chuyện của chúng tôi</h2>
            <p className="text-muted">
              Xuất phát từ đam mê du lịch và mong muốn đơn giản hóa trải nghiệm đặt tour, ZakiBooking xây dựng
              hệ sinh thái dịch vụ gồm tour trong nước, quốc tế, báo giá vé máy bay và hỗ trợ di chuyển linh hoạt.
            </p>
            <p className="text-muted mb-4">
              Với đội ngũ am hiểu điểm đến và quy trình vận hành chuyên nghiệp, chúng tôi cam kết đồng hành cùng
              bạn từ bước chọn tour đến khi hoàn thành chuyến đi.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/tour" className="btn btn-primary rounded-pill px-4 fw-bold">
                Khám phá tour
              </Link>
              <a href={HOTLINE_TEL} className="btn btn-outline-dark rounded-pill px-4 fw-bold">
                <i className="bi bi-telephone me-2" />
                {HOTLINE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Vì sao chọn ZakiBooking?</h2>
          <div className="row g-4">
            {VALUES.map((v) => (
              <div key={v.title} className="col-md-6 col-lg-3">
                <div className="about-value-card h-100 text-center p-4">
                  <div className="about-value-icon mx-auto mb-3">
                    <i className={`bi ${v.icon}`} />
                  </div>
                  <h5 className="fw-bold">{v.title}</h5>
                  <p className="text-muted small mb-0">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Sẵn sàng bắt đầu hành trình?</h3>
        <p className="text-muted mb-4">Xem ưu đãi hot hoặc liên hệ để được tư vấn lộ trình phù hợp.</p>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          <Link to="/uu-dai" className="btn btn-danger rounded-pill px-4 fw-bold">
            Xem khuyến mãi
          </Link>
          <Link to="/contact" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
            Liên hệ hỗ trợ
          </Link>
        </div>
      </section>
    </div>
  );
}

export { AboutPage };
