import { useState } from "react";
import { submitContact } from "../api/reviews";
import { ApiError } from "../api/client";

function ContactPage() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submitContact({
        hoTen: String(fd.get("hoTen")),
        email: String(fd.get("email")),
        noiDung: String(fd.get("noiDung")),
        tieuDe: "Liên hệ từ website",
      });
      setMsg("Đã gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm.");
      e.currentTarget.reset();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Gửi thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="contact-hero text-center">
        <div className="container animate-fade-in">
          <span className="contact-badge">
            <i className="bi bi-envelope-open-fill"></i> LIÊN HỆ
          </span>
          <h1 className="contact-hero-title">Liên hệ với chúng tôi</h1>
          <p className="contact-hero-lead mb-0">
            ZakiBooking luôn sẵn sàng đồng hành và hỗ trợ bạn 24/7 trên mọi nẻo
            đường hành trình.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="contact-stats-bar">
        <div className="container">
          <div className="row g-3 justify-content-center">
            <div className="col-6 col-md-3">
              <div className="contact-stat-item">
                <span className="contact-stat-num">&lt; 10m</span>
                <span className="contact-stat-label">Thời gian phản hồi</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="contact-stat-item">
                <span className="contact-stat-num">99.8%</span>
                <span className="contact-stat-label">Khách hàng hài lòng</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="contact-stat-item">
                <span className="contact-stat-num">24/7</span>
                <span className="contact-stat-label">Hỗ trợ khẩn cấp</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="contact-stat-item">
                <span className="contact-stat-num">+84866147595</span>
                <span className="contact-stat-label">Hotline Miễn Phí</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container contact-main">
        <div className="row g-4">
          {/* Left Column: Contact Details */}
          <div className="col-lg-5 contact-info-animate">
            <div className="contact-info-stack">
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <h3>Địa chỉ văn phòng</h3>
                  <p className="mb-0">Đông Lao, Hoài Đức, Hà Nội</p>
                  <small className="text-muted">Trụ sở chính ZakiBooking</small>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <div>
                  <h3>Hotline hỗ trợ</h3>
                  <p className="mb-0">
                    <a href="tel:18006789">+84866147595</a>
                  </p>
                  <small className="text-muted">
                    Hotline 24/7 (Miễn phí cuộc gọi)
                  </small>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div>
                  <h3>Email liên hệ</h3>
                  <p className="mb-0">
                    <a href="mailto:support@zakibooking.vn">
                      minhd4360@gmail.com
                    </a>
                  </p>
                  <small className="text-muted">
                    Phản hồi trong vòng 24 giờ làm việc
                  </small>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <i className="bi bi-clock-fill"></i>
                </div>
                <div>
                  <h3>Giờ làm việc</h3>
                  <p className="mb-0">T2–T7: 8:00–21:00, CN: 9:00–18:00</p>
                  <small className="text-muted">
                    Hỗ trợ khẩn cấp 24/7 qua hotline
                  </small>
                </div>
              </div>

              <div className="contact-info-card contact-info-ai">
                <div className="contact-info-icon">
                  <i className="bi bi-robot"></i>
                </div>
                <div>
                  <h3>Trợ lý ảo AI Zaki</h3>
                  <p className="small mb-1">
                    Trò chuyện với AI của chúng tôi để được tư vấn và hỗ trợ lập
                    lịch trình tour ngay lập tức.
                  </p>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm rounded-pill mt-2 px-3 fw-bold"
                    onClick={() => {
                      const chatToggle =
                        document.querySelector(".chatbot-toggle");
                      if (chatToggle) {
                        chatToggle.click();
                      }
                    }}
                  >
                    Trò chuyện ngay
                  </button>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <i className="bi bi-share-fill"></i>
                </div>
                <div>
                  <h3>Kết nối mạng xã hội</h3>
                  <p className="small mb-2">
                    Theo dõi và nhận tư vấn nhanh qua các kênh liên lạc chính
                    thức
                  </p>
                  <div className="contact-social-links">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="contact-social-btn facebook"
                    >
                      <i className="bi bi-facebook"></i> Facebook
                    </a>
                    <a
                      href="https://zalo.me"
                      target="_blank"
                      rel="noreferrer"
                      className="contact-social-btn zalo"
                    >
                      <i className="bi bi-chat-dots-fill"></i> Zalo Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="col-lg-7 contact-form-animate">
            <div className="contact-form-card">
              <h2 className="contact-form-title fw-bold">
                Gửi tin nhắn cho chúng tôi
              </h2>
              <p className="text-muted mb-4">
                Nếu bạn có bất kỳ câu hỏi, phản hồi hay yêu cầu đặc biệt nào,
                xin vui lòng gửi tin nhắn. Đội ngũ của chúng tôi sẽ liên hệ lại
                sớm nhất.
              </p>

              {msg && <div className="alert alert-success">{msg}</div>}
              {err && <div className="alert alert-danger">{err}</div>}

              <form onSubmit={onSubmit} autoComplete="off">
                <div className="row g-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Họ và tên</label>
                    <input
                      name="hoTen"
                      className="form-control contact-input"
                      placeholder="Nhập họ và tên..."
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Địa chỉ Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control contact-input"
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Nội dung liên hệ</label>
                  <textarea
                    name="noiDung"
                    className="form-control contact-input"
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn hoặc câu hỏi của bạn tại đây..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 shadow-sm fw-bold text-uppercase"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi tin nhắn"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="row mt-5">
          <div className="col-12 contact-info-animate">
            <h3 className="fw-bold mb-3 text-center text-lg-start">
              Vị trí văn phòng ZakiBooking
            </h3>
            <div className="contact-map-wrapper">
              <iframe
                title="ZakiBooking Hanoi Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d784.2439853056904!2d105.715023!3d20.9743346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134524b6322f16b%3A0xee83dd941bf7e7b1!2zxJDDtG5nIExhbywgQW4gS2jDoW5oLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { ContactPage };
