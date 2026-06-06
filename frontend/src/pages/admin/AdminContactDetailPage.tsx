import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContact, type AdminContact } from '../../api/adminContacts'

function formatDateTime(iso?: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminContactDetailPage() {
  const { id } = useParams()
  const [contact, setContact] = useState<AdminContact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getContact(Number(id))
      .then((r) => setContact(r.data))
      .catch(() => setContact(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-muted py-5">Đang tải...</div>
  }

  if (!contact) {
    return <div className="text-muted py-5">Không tìm thấy liên hệ.</div>
  }

  const isNew = contact.trangThai === 'NEW'

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin/contact" className="text-decoration-none text-muted fw-bold">
                Hòm thư
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
              Nội dung chi tiết
            </li>
          </ol>
        </nav>
        <Link
          to="/admin/contact"
          className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold shadow-sm bg-white"
        >
          <i className="bi bi-arrow-left me-1" /> Quay lại
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-primary"
          style={{ width: 60, height: 60 }}
        >
          <i className="bi bi-person-fill fs-3 text-white" />
        </div>
        <div>
          <h4 className="fw-bolder mb-1 text-dark">{contact.hoTen}</h4>
          <p className="text-secondary small mb-0">
            <i className="bi bi-envelope me-1" /> {contact.email} &bull;{' '}
            <i className="bi bi-clock ms-2 me-1" /> {formatDateTime(contact.createdAt)}
          </p>
        </div>
        <div className="ms-auto d-flex gap-2">
          <div className="bg-white border rounded-pill px-4 py-2 shadow-sm d-flex align-items-center">
            <span className="text-uppercase small fw-bold text-muted me-2 border-end pe-2">
              Trạng thái
            </span>
            {isNew ? (
              <span className="text-danger fw-bold">
                <i className="bi bi-record-circle-fill me-1" /> Mới
              </span>
            ) : (
              <span className="text-success fw-bold">
                <i className="bi bi-check-circle-fill me-1" /> Đã tiếp nhận
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="card-body p-5">
          <div className="row g-5">
            <div className="col-lg-8 border-end pe-lg-5">
              <h5 className="fw-bolder mb-4 text-dark">
                <i className="bi bi-journal-text me-2 text-primary" />
                Nội dung trao đổi
              </h5>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  Chủ đề chính
                </label>
                <div className="bg-light rounded-3 p-3 border fw-semibold text-dark fs-5">
                  {contact.tieuDe || 'Không có tiêu đề'}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  Nội dung chi tiết
                </label>
                <div
                  className="bg-light rounded-3 p-4 border text-dark lh-lg"
                  style={{ minHeight: 180, whiteSpace: 'pre-wrap' }}
                >
                  {contact.noiDung}
                </div>
              </div>
            </div>

            <div className="col-lg-4 ps-lg-4">
              <h5 className="fw-bolder mb-4 text-dark">
                <i className="bi bi-info-square me-2 text-primary" />
                Thông tin hồ sơ
              </h5>

              <div className="d-flex flex-column gap-4">
                <div>
                  <span className="d-block text-muted small fw-bold text-uppercase mb-1">
                    Loại yêu cầu
                  </span>
                  {contact.loai === 'TOUR' ? (
                    <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light w-100 text-start">
                      <i className="bi bi-map me-2 text-success" />
                      Tư vấn Đặt Tour
                    </span>
                  ) : contact.loai === 'SUPPORT' ? (
                    <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light w-100 text-start">
                      <i className="bi bi-headset me-2 text-primary" />
                      Hỗ trợ Chăm sóc
                    </span>
                  ) : (
                    <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light w-100 text-start">
                      <i className="bi bi-question-circle me-2 text-warning" />
                      Nhu cầu khác
                    </span>
                  )}
                </div>

                <div>
                  <span className="d-block text-muted small fw-bold text-uppercase mb-1">
                    Số điện thoại
                  </span>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-telephone-fill text-muted me-2" />
                    <span className="fw-semibold text-dark">
                      {contact.soDienThoai || 'Không cung cấp'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="d-block text-muted small fw-bold text-uppercase mb-1">
                    Địa chỉ
                  </span>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-geo-alt-fill text-muted me-2 mt-1" />
                    <span className="fw-semibold text-dark">{contact.diaChi || 'Không cung cấp'}</span>
                  </div>
                </div>

                <div>
                  <span className="d-block text-muted small fw-bold text-uppercase mb-1">
                    Số khách dự kiến
                  </span>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-people-fill text-muted me-2" />
                    <span className="fw-semibold text-dark">
                      {contact.soKhach != null ? `${contact.soKhach} khách` : 'Chưa xác định'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
