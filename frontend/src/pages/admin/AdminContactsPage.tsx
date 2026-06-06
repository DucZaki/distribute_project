import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listContacts, type AdminContact } from '../../api/adminContacts'
import { AdminPagination } from '../../components/admin/AdminPagination'

function formatDate(iso?: string) {
  if (!iso) return { date: '-', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: iso.slice(0, 10), time: '' }
  return {
    date: d.toLocaleDateString('vi-VN'),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }
}

function contactTypeBadge(c: AdminContact) {
  if (c.loai === 'TOUR') {
    return (
      <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light shadow-sm">
        <i className="bi bi-map me-1 text-success" /> Đặt Tour
      </span>
    )
  }
  if (c.loai === 'SUPPORT') {
    return (
      <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light shadow-sm">
        <i className="bi bi-headset me-1 text-primary" /> Hỗ Trợ
      </span>
    )
  }
  return (
    <span className="badge rounded-pill border fw-bold text-dark px-3 py-2 bg-light shadow-sm">
      <i className="bi bi-question-circle me-1 text-warning" /> Khác
    </span>
  )
}

export function AdminContactsPage() {
  const [items, setItems] = useState<AdminContact[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  function load(p = 0) {
    listContacts(undefined, p, 20)
      .then((r) => {
        setItems(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
        setPage(r.data.page ?? p)
      })
      .catch(() => setItems([]))
  }

  useEffect(() => {
    load(0)
  }, [])

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder mb-1 text-dark">
            <i className="bi bi-envelope-paper me-2 text-primary" />
            Danh sách hòm thư
          </h3>
          <p className="text-secondary small mb-0">Quản lý và phản hồi các yêu cầu từ phía khách hàng</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-dark btn-sm rounded-pill fw-bold"
            onClick={() => load(page)}
          >
            <i className="bi bi-arrow-clockwise me-1" /> Làm mới
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 border-0">
              <thead className="table-light">
                <tr className="text-uppercase small text-muted">
                  <th className="ps-4 fw-bold border-0">Khách Hàng</th>
                  <th className="fw-bold border-0">Phân Loại</th>
                  <th className="fw-bold border-0">Số Khách</th>
                  <th className="fw-bold border-0">Ngày Gửi</th>
                  <th className="fw-bold border-0 text-center">Trạng Thái</th>
                  <th className="text-center pe-4 fw-bold border-0">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const { date, time } = formatDate(c.createdAt)
                  const initial = (c.hoTen?.charAt(0) ?? '?').toUpperCase()
                  return (
                    <tr key={c.id} className="border-bottom border-light">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-primary"
                            style={{ width: 40, height: 40 }}
                          >
                            <span className="fs-5 fw-bold text-white">{initial}</span>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 text-dark">{c.hoTen}</h6>
                            <small className="text-secondary">{c.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{contactTypeBadge(c)}</td>
                      <td>
                        <span className="fw-semibold text-dark">
                          <i className="bi bi-people-fill text-muted me-1" />{' '}
                          {c.soKhach ?? 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary small fw-medium">{date}</span>
                        <br />
                        <span className="text-muted small">{time}</span>
                      </td>
                      <td className="text-center">
                        {c.trangThai === 'NEW' ? (
                          <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm fw-bold">
                            Mới Nhận
                          </span>
                        ) : (
                          <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm fw-bold text-white">
                            Đã Xử Lý
                          </span>
                        )}
                      </td>
                      <td className="text-center pe-4">
                        <Link
                          to={`/admin/contact/${c.id}`}
                          className="btn btn-sm btn-outline-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32 }}
                          title="Xem chi tiết"
                        >
                          <i className="bi bi-eye" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="py-4">
                        <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-3 d-block" />
                        <h5 className="fw-bolder text-dark">Hòm thư trống</h5>
                        <p className="text-muted small mb-0">
                          Chưa có liên hệ nào từ khách hàng ở khoảng thời gian này.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminPagination page={page} totalPages={totalPages} onPage={(p) => load(p)} />
    </div>
  )
}
