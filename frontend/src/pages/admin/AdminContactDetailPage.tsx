import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContact, updateContactStatus, type Contact } from '../../api/adminContacts'

export function AdminContactDetailPage() {
  const { id } = useParams()
  const [contact, setContact] = useState<Contact | null>(null)

  useEffect(() => {
    if (!id) return
    getContact(Number(id)).then((r) => {
      setContact(r.data)
      if (r.data?.trangThai === 'NEW') {
        updateContactStatus(r.data.id, 'READ')
          .then((updated) => setContact(updated.data))
          .catch(() => {})
      }
    }).catch(() => setContact(null))
  }, [id])

  if (!contact) return <div className="text-muted py-5">Đang tải...</div>

  return (
    <div className="container-fluid px-0" style={{ maxWidth: 720 }}>
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold mb-0">Chi tiết liên hệ</h2>
        <Link to="/admin/contact" className="btn btn-outline-secondary btn-sm">Quay lại</Link>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <p><strong>Họ tên:</strong> {contact.hoTen}</p>
        <p><strong>Email:</strong> {contact.email}</p>
        <p><strong>SĐT:</strong> {contact.soDienThoai || '-'}</p>
        <p><strong>Tiêu đề:</strong> {contact.tieuDe || '-'}</p>
        <p><strong>Trạng thái:</strong> {contact.trangThai}</p>
        <hr />
        <div className="bg-light p-3 rounded">{contact.noiDung}</div>
      </div>
    </div>
  )
}
