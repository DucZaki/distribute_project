import { type FormEvent, useState } from 'react'
import { submitContact } from '../api/reviews'
import { ApiError } from '../api/client'

export function ContactPage() {
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg('')
    setErr('')
    const fd = new FormData(e.currentTarget)
    try {
      await submitContact({
        hoTen: String(fd.get('hoTen')),
        email: String(fd.get('email')),
        noiDung: String(fd.get('noiDung')),
        tieuDe: 'Liên hệ từ website',
      })
      setMsg('Đã gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm.')
      e.currentTarget.reset()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Gửi thất bại')
    }
  }

  return (
    <div className="container contact-page py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-2">Liên hệ với chúng tôi</h1>
          <p className="text-muted mb-4">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={onSubmit} className="card border-0 shadow-sm p-4">
            <div className="mb-3">
              <label className="form-label">Họ tên</label>
              <input name="hoTen" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Nội dung</label>
              <textarea name="noiDung" className="form-control" rows={5} required />
            </div>
            <button type="submit" className="btn btn-primary px-4">Gửi liên hệ</button>
          </form>
        </div>
      </div>
    </div>
  )
}
